import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface InsurancePlan {
  id: string;
  insurance_id: string;
  name: string;
  description: string | null;
  coverage_rate: number;
  annual_limit: number | null;
  is_active: boolean;
  created_at: string;
  insurance?: {
    id: string;
    name: string;
  };
}

export interface PlanLimit {
  id: string;
  plan_id: string;
  care_type: string;
  annual_limit: number;
  per_act_limit: number | null;
  coverage_rate: number | null;
}

export interface PatientConsumption {
  id: string;
  patient_insurance_id: string;
  care_type: string;
  year: number;
  total_consumed: number;
  total_covered: number;
  last_updated_at: string;
}

export interface CareAuthorizationRequest {
  id: string;
  patient_insurance_id: string;
  doctor_id: string | null;
  care_type: string;
  requested_amount: number;
  care_description: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_amount: number | null;
  rejection_reason: string | null;
  requested_at: string;
  responded_at: string | null;
  validity_date: string | null;
}

export interface CoverageStatus {
  isActive: boolean;
  planName: string;
  insuranceName: string;
  coverageRate: number;
  annualLimit: number | null;
  consumptionByType: {
    care_type: string;
    consumed: number;
    covered: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  }[];
  totalConsumed: number;
  totalCovered: number;
  overallRemaining: number;
}

export const CARE_TYPES = {
  consultation_generale: 'Consultations générales',
  consultation_specialisee: 'Consultations spécialisées',
  actes_medicaux: 'Actes médicaux',
  pharmacie: 'Pharmacie'
} as const;

// Hook pour récupérer la couverture d'un patient
export function usePatientCoverage(patientId?: string) {
  return useQuery({
    queryKey: ['patient-coverage', patientId],
    queryFn: async () => {
      if (!patientId) return null;

      // Récupérer l'assurance active du patient
      const { data: patientInsurance, error: piError } = await supabase
        .from('patient_insurances')
        .select(`
          *,
          insurances (id, name, coverage_rate, annual_limit)
        `)
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single();

      if (piError || !patientInsurance) return null;

      // Récupérer la formule souscrite
      const { data: patientPlan } = await supabase
        .from('patient_insurance_plans')
        .select(`
          *,
          insurance_plans (*)
        `)
        .eq('patient_insurance_id', patientInsurance.id)
        .eq('is_active', true)
        .single();

      // Récupérer les limites par type de soin
      const planId = patientPlan?.plan_id;
      let planLimits: PlanLimit[] = [];
      
      if (planId) {
        const { data } = await supabase
          .from('insurance_plan_limits')
          .select('*')
          .eq('plan_id', planId);
        planLimits = (data as PlanLimit[]) || [];
      }

      // Récupérer les consommations de l'année en cours
      const currentYear = new Date().getFullYear();
      const { data: consumptions } = await supabase
        .from('patient_care_consumption')
        .select('*')
        .eq('patient_insurance_id', patientInsurance.id)
        .eq('year', currentYear);

      // Calculer le status de couverture
      const insurance = patientInsurance.insurances as { id: string; name: string; coverage_rate: number; annual_limit: number } | null;
      const plan = patientPlan?.insurance_plans as InsurancePlan | null;
      
      const consumptionByType = Object.keys(CARE_TYPES).map(careType => {
        const limit = planLimits.find(l => l.care_type === careType);
        const consumption = (consumptions as PatientConsumption[] | null)?.find(c => c.care_type === careType);
        
        const annualLimit = limit?.annual_limit || plan?.annual_limit || insurance?.annual_limit || 0;
        const consumed = consumption?.total_consumed || 0;
        const covered = consumption?.total_covered || 0;
        
        return {
          care_type: careType,
          consumed,
          covered,
          limit: annualLimit,
          remaining: Math.max(0, annualLimit - covered),
          percentUsed: annualLimit > 0 ? (covered / annualLimit) * 100 : 0
        };
      });

      const totalConsumed = consumptionByType.reduce((sum, c) => sum + c.consumed, 0);
      const totalCovered = consumptionByType.reduce((sum, c) => sum + c.covered, 0);
      const overallLimit = plan?.annual_limit || insurance?.annual_limit || 0;

      return {
        patientInsuranceId: patientInsurance.id,
        isActive: true,
        planName: plan?.name || 'Formule standard',
        insuranceName: insurance?.name || 'Assurance inconnue',
        coverageRate: plan?.coverage_rate || insurance?.coverage_rate || 80,
        annualLimit: overallLimit,
        consumptionByType,
        totalConsumed,
        totalCovered,
        overallRemaining: Math.max(0, overallLimit - totalCovered),
        planLimits
      };
    },
    enabled: !!patientId
  });
}

// Hook pour vérifier si une autorisation est nécessaire
export function useCheckAuthorization(patientId?: string, careType?: string, amount?: number) {
  const { data: coverage } = usePatientCoverage(patientId);
  
  if (!coverage || !careType || !amount) return { needsAuthorization: false, reason: null };
  
  const typeConsumption = coverage.consumptionByType.find(c => c.care_type === careType);
  if (!typeConsumption) return { needsAuthorization: false, reason: null };
  
  const coveredAmount = amount * (coverage.coverageRate / 100);
  
  if (typeConsumption.remaining < coveredAmount) {
    return {
      needsAuthorization: true,
      reason: `Plafond ${CARE_TYPES[careType as keyof typeof CARE_TYPES]} atteint. Reste disponible: ${typeConsumption.remaining.toLocaleString()} FCFA`
    };
  }
  
  return { needsAuthorization: false, reason: null };
}

// Hook pour créer une demande d'autorisation
export function useCreateAuthorizationRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: {
      patient_insurance_id: string;
      doctor_id: string;
      care_type: string;
      requested_amount: number;
      care_description: string;
    }) => {
      const { data, error } = await supabase
        .from('care_authorization_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorization-requests'] });
      toast.success('Demande d\'autorisation envoyée');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'envoi de la demande');
      console.error(error);
    }
  });
}

// Hook pour récupérer les demandes d'autorisation
export function useAuthorizationRequests(patientInsuranceId?: string, status?: string) {
  return useQuery({
    queryKey: ['authorization-requests', patientInsuranceId, status],
    queryFn: async () => {
      let query = supabase
        .from('care_authorization_requests')
        .select(`
          *,
          patient_insurances (
            id,
            policy_number,
            patients (
              id,
              profiles:user_id (first_name, last_name)
            ),
            insurances (id, name)
          )
        `)
        .order('requested_at', { ascending: false });
      
      if (patientInsuranceId) {
        query = query.eq('patient_insurance_id', patientInsuranceId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

// Hook pour répondre à une demande (pour les agents assureur)
export function useRespondToAuthorizationRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (response: {
      requestId: string;
      status: 'approved' | 'rejected';
      approved_amount?: number;
      rejection_reason?: string;
      validity_date?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('care_authorization_requests')
        .update({
          status: response.status,
          approved_amount: response.approved_amount,
          rejection_reason: response.rejection_reason,
          validity_date: response.validity_date,
          responded_at: new Date().toISOString(),
          responded_by: userData.user?.id
        })
        .eq('id', response.requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['authorization-requests'] });
      toast.success(variables.status === 'approved' ? 'Demande approuvée' : 'Demande refusée');
    },
    onError: (error) => {
      toast.error('Erreur lors du traitement de la demande');
      console.error(error);
    }
  });
}

// Hook pour mettre à jour la consommation après un soin
export function useUpdateConsumption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      patient_insurance_id: string;
      care_type: string;
      amount: number;
      covered_amount: number;
    }) => {
      const { error } = await supabase.rpc('update_patient_consumption', {
        p_patient_insurance_id: params.patient_insurance_id,
        p_care_type: params.care_type,
        p_amount: params.amount,
        p_covered_amount: params.covered_amount
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-coverage'] });
      queryClient.invalidateQueries({ queryKey: ['patient-consumption'] });
    }
  });
}
