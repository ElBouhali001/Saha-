
import { supabase } from '@/integrations/supabase/client';
import { GlobalPatient, PatientTenantAccess } from '@/types/tenant';
import crypto from 'crypto-js';

export interface PatientInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  socialSecurityNumber: string;
}

export interface PatientCreationResult {
  status: 'new_patient' | 'existing_with_access' | 'existing_without_access';
  patient?: any;
  globalPatientId?: string;
  message: string;
  requiresConsent?: boolean;
  otherTenants?: Array<{
    name: string;
    lastVisit?: string;
    hasConsent: boolean;
  }>;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

export class PatientService {
  static async createOrFindPatient(
    patientData: PatientInput,
    tenantId: string
  ): Promise<PatientCreationResult> {
    try {
      // 1. Calculer le hash unique
      const uniqueHash = this.calculateUniqueHash(patientData);
      
      // 2. Rechercher dans la table globale
      const { data: existingGlobalPatient, error: searchError } = await supabase
        .from('global_patients')
        .select('*')
        .eq('unique_hash', uniqueHash)
        .maybeSingle();

      if (searchError) {
        throw searchError;
      }

      if (existingGlobalPatient) {
        // 3a. Patient existe globalement
        return await this.handleExistingPatient(existingGlobalPatient, tenantId);
      } else {
        // 3b. Nouveau patient
        return await this.createNewPatient(patientData, tenantId, uniqueHash);
      }
    } catch (error) {
      console.error('Erreur lors de la création/recherche du patient:', error);
      throw error;
    }
  }

  private static async handleExistingPatient(
    globalPatient: GlobalPatient,
    tenantId: string
  ): Promise<PatientCreationResult> {
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
        message: 'Patient déjà dans votre base de données'
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

    const otherTenants = otherAccesses?.map(access => ({
      name: access.tenant?.name || 'Organisation inconnue',
      hasConsent: access.consent_status === 'granted'
    })) || [];

    return {
      status: 'existing_without_access',
      globalPatientId: globalPatient.id,
      message: `Ce patient existe déjà dans ${otherTenants.length} autre(s) organisation(s)`,
      requiresConsent: true,
      otherTenants,
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

  private static async createNewPatient(
    patientData: PatientInput,
    tenantId: string,
    uniqueHash: string
  ): Promise<PatientCreationResult> {
    // Hasher le numéro de sécurité sociale
    const ssnHash = crypto.SHA256(patientData.socialSecurityNumber).toString();

    // Créer le patient global
    const { data: globalPatient, error: globalError } = await supabase
      .from('global_patients')
      .insert({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        birth_date: patientData.birthDate,
        social_security_number_hash: ssnHash,
        unique_hash: uniqueHash,
        created_by_tenant_id: tenantId
      })
      .select()
      .single();

    if (globalError) {
      throw globalError;
    }

    // Créer le patient local
    const { data: localPatient, error: localError } = await supabase
      .from('patients')
      .insert({
        user_id: null, // Sera lié plus tard si le patient s'inscrit
        date_of_birth: patientData.birthDate,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (localError) {
      throw localError;
    }

    // Créer l'accès tenant
    const { error: accessError } = await supabase
      .from('patient_tenant_access')
      .insert({
        global_patient_id: globalPatient.id,
        tenant_id: tenantId,
        local_patient_id: localPatient.id,
        access_level: 'full',
        consent_status: 'granted'
      });

    if (accessError) {
      throw accessError;
    }

    return {
      status: 'new_patient',
      patient: localPatient,
      message: 'Nouveau patient créé avec succès'
    };
  }

  static calculateUniqueHash(patient: PatientInput): string {
    const normalized = {
      firstName: this.normalizeString(patient.firstName),
      lastName: this.normalizeString(patient.lastName),
      birthDate: patient.birthDate,
      ssn: patient.socialSecurityNumber.replace(/\s/g, '')
    };

    const dataString = `${normalized.firstName}|${normalized.lastName}|${normalized.birthDate}|${normalized.ssn}`;
    return crypto.SHA256(dataString).toString();
  }

  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9]/g, ''); // Garder uniquement alphanumériques
  }

  static async requestPatientAccess(
    globalPatientId: string,
    requestingTenantId: string,
    reason: string
  ): Promise<void> {
    // Trouver le tenant propriétaire
    const { data: ownerAccess } = await supabase
      .from('patient_tenant_access')
      .select('tenant_id')
      .eq('global_patient_id', globalPatientId)
      .limit(1)
      .single();

    if (!ownerAccess) {
      throw new Error('Propriétaire du dossier patient non trouvé');
    }

    // Créer la demande d'accès
    const { error } = await supabase
      .from('patient_access_requests')
      .insert({
        global_patient_id: globalPatientId,
        requesting_tenant_id: requestingTenantId,
        owning_tenant_id: ownerAccess.tenant_id,
        request_reason: reason,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) {
      throw error;
    }
  }
}
