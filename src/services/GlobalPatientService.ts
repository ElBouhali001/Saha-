
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto-js';

export interface GlobalPatient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  social_security_number_hash: string;
  unique_hash: string;
  created_at: string;
  created_by_tenant_id: string;
}

export interface PatientTenantAccess {
  id: string;
  global_patient_id: string;
  tenant_id: string;
  local_patient_id: string;
  access_level: 'full' | 'readonly' | 'emergency';
  consent_status: 'granted' | 'pending' | 'refused';
  consent_date?: string;
  created_at: string;
}

export interface PatientAccessRequest {
  id: string;
  global_patient_id: string;
  requesting_tenant_id: string;
  owning_tenant_id: string;
  request_reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  response_message?: string;
  requested_at: string;
  responded_at?: string;
  expires_at: string;
}

export interface PatientCreateResult {
  status: 'new_patient' | 'existing_with_access' | 'existing_without_access';
  patient?: any;
  globalPatientId?: string;
  message: string;
  requiresConsent?: boolean;
  existingTenants?: Array<{
    name: string;
    lastVisit?: string;
    hasConsent: boolean;
  }>;
  actions?: Array<{
    label: string;
    action: 'REQUEST_ACCESS' | 'CREATE_LOCAL' | 'MERGE';
  }>;
}

export class GlobalPatientService {
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9]/g, ''); // Garder uniquement alphanumériques
  }

  private calculateUniqueHash(patientData: {
    firstName: string;
    lastName: string;
    birthDate: string;
    socialSecurityNumber: string;
  }): string {
    const normalized = {
      firstName: this.normalizeString(patientData.firstName),
      lastName: this.normalizeString(patientData.lastName),
      birthDate: patientData.birthDate,
      ssn: patientData.socialSecurityNumber.replace(/\s/g, '')
    };

    const dataString = `${normalized.firstName}|${normalized.lastName}|${normalized.birthDate}|${normalized.ssn}`;
    return crypto.SHA256(dataString).toString();
  }

  async createOrFindPatient(
    patientData: {
      firstName: string;
      lastName: string;
      birthDate: string;
      socialSecurityNumber: string;
      [key: string]: any;
    },
    tenantId: string
  ): Promise<PatientCreateResult> {
    try {
      // 1. Calculer le hash unique
      const uniqueHash = this.calculateUniqueHash({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        birthDate: patientData.birthDate,
        socialSecurityNumber: patientData.socialSecurityNumber
      });

      // 2. Rechercher dans la table globale
      const { data: existingGlobalPatient, error: searchError } = await supabase
        .from('global_patients')
        .select('*')
        .eq('unique_hash', uniqueHash)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingGlobalPatient) {
        // 3a. Patient existe globalement
        return this.handleExistingPatient(existingGlobalPatient, tenantId);
      } else {
        // 3b. Nouveau patient
        return this.createNewPatient(patientData, tenantId, uniqueHash);
      }
    } catch (error) {
      console.error('Erreur lors de la création/recherche du patient:', error);
      throw error;
    }
  }

  private async handleExistingPatient(
    globalPatient: GlobalPatient,
    tenantId: string
  ): Promise<PatientCreateResult> {
    // Vérifier si le tenant a déjà accès
    const { data: existingAccess } = await supabase
      .from('patient_tenant_access')
      .select('*')
      .eq('global_patient_id', globalPatient.id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (existingAccess) {
      return {
        status: 'existing_with_access',
        patient: existingAccess,
        message: 'Patient déjà dans votre base'
      };
    }

    // Patient existe mais pas d'accès pour ce tenant
    const { data: otherAccesses } = await supabase
      .from('patient_tenant_access')
      .select(`
        *,
        tenant:tenants(name)
      `)
      .eq('global_patient_id', globalPatient.id);

    const existingTenants = otherAccesses?.map(access => ({
      name: access.tenant?.name || 'Organisation inconnue',
      hasConsent: access.consent_status === 'granted'
    })) || [];

    return {
      status: 'existing_without_access',
      globalPatientId: globalPatient.id,
      message: `Ce patient existe déjà dans ${existingTenants.length} autre(s) organisation(s)`,
      requiresConsent: true,
      existingTenants,
      actions: [
        {
          label: 'Demander l\'accès au dossier',
          action: 'REQUEST_ACCESS'
        },
        {
          label: 'Créer un nouveau dossier local',
          action: 'CREATE_LOCAL'
        }
      ]
    };
  }

  private async createNewPatient(
    patientData: any,
    tenantId: string,
    uniqueHash: string
  ): Promise<PatientCreateResult> {
    // Créer le patient global
    const { data: globalPatient, error: globalError } = await supabase
      .from('global_patients')
      .insert({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        birth_date: patientData.birthDate,
        social_security_number_hash: crypto.SHA256(patientData.socialSecurityNumber).toString(),
        unique_hash: uniqueHash,
        created_by_tenant_id: tenantId
      })
      .select()
      .single();

    if (globalError) throw globalError;

    // Créer le patient local
    const { data: localPatient, error: localError } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        tenant_id: tenantId,
        num_secu_sociale: patientData.socialSecurityNumber
      })
      .select()
      .single();

    if (localError) throw localError;

    // Créer l'accès tenant-patient
    const { error: accessError } = await supabase
      .from('patient_tenant_access')
      .insert({
        global_patient_id: globalPatient.id,
        tenant_id: tenantId,
        local_patient_id: localPatient.id,
        access_level: 'full',
        consent_status: 'granted',
        consent_date: new Date().toISOString()
      });

    if (accessError) throw accessError;

    return {
      status: 'new_patient',
      patient: localPatient,
      message: 'Nouveau patient créé avec succès'
    };
  }

  async requestAccess(
    globalPatientId: string,
    requestingTenantId: string,
    reason: string
  ): Promise<void> {
    // Trouver les tenants propriétaires
    const { data: owningAccesses } = await supabase
      .from('patient_tenant_access')
      .select('tenant_id')
      .eq('global_patient_id', globalPatientId);

    if (!owningAccesses?.length) return;

    // Créer des demandes d'accès pour chaque tenant propriétaire
    const requests = owningAccesses.map(access => ({
      global_patient_id: globalPatientId,
      requesting_tenant_id: requestingTenantId,
      owning_tenant_id: access.tenant_id,
      request_reason: reason,
      status: 'pending' as const
    }));

    const { error } = await supabase
      .from('patient_access_requests')
      .insert(requests);

    if (error) throw error;
  }

  async approveAccessRequest(requestId: string, responseMessage?: string): Promise<void> {
    const { data: request, error: updateError } = await supabase
      .from('patient_access_requests')
      .update({
        status: 'approved',
        response_message: responseMessage,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Créer l'accès patient-tenant
    const { error: accessError } = await supabase
      .from('patient_tenant_access')
      .insert({
        global_patient_id: request.global_patient_id,
        tenant_id: request.requesting_tenant_id,
        local_patient_id: null, // À remplir selon le contexte
        access_level: 'readonly',
        consent_status: 'granted',
        consent_date: new Date().toISOString()
      });

    if (accessError) throw accessError;
  }
}

export const globalPatientService = new GlobalPatientService();
