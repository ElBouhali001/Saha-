export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          consultation_type: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          payment_method: string | null
          payment_status: string | null
          reason: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          consultation_type?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reason?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          consultation_type?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reason?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string | null
          consultation_date: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          symptoms: string | null
          tenant_id: string | null
          treatment_plan: string | null
          updated_at: string | null
          vitals: Json | null
        }
        Insert: {
          appointment_id?: string | null
          consultation_date?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          symptoms?: string | null
          tenant_id?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          vitals?: Json | null
        }
        Update: {
          appointment_id?: string | null
          consultation_date?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          symptoms?: string | null
          tenant_id?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_specialties: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          id: string
          is_primary: boolean | null
          specialty_id: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_primary?: boolean | null
          specialty_id?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_primary?: boolean | null
          specialty_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_specialties_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_status: string | null
          consultation_fee: number | null
          created_at: string | null
          id: string
          license_number: string | null
          specialty_id: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          specialty_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          specialty_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      global_patients: {
        Row: {
          birth_date: string
          created_at: string | null
          created_by_tenant_id: string | null
          first_name: string
          id: string
          last_name: string
          social_security_number_hash: string
          unique_hash: string
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          created_by_tenant_id?: string | null
          first_name: string
          id?: string
          last_name: string
          social_security_number_hash: string
          unique_hash: string
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          created_by_tenant_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          social_security_number_hash?: string
          unique_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_patients_created_by_tenant_id_fkey"
            columns: ["created_by_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          amount_approved: number | null
          amount_claimed: number
          created_at: string | null
          id: string
          invoice_id: string | null
          patient_insurance_id: string | null
          payment_date: string | null
          rejection_reason: string | null
          response_date: string | null
          status: string | null
          transmission_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount_approved?: number | null
          amount_claimed: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          patient_insurance_id?: string | null
          payment_date?: string | null
          rejection_reason?: string | null
          response_date?: string | null
          status?: string | null
          transmission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_approved?: number | null
          amount_claimed?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          patient_insurance_id?: string | null
          payment_date?: string | null
          rejection_reason?: string | null
          response_date?: string | null
          status?: string | null
          transmission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_insurance_id_fkey"
            columns: ["patient_insurance_id"]
            isOneToOne: false
            referencedRelation: "patient_insurances"
            referencedColumns: ["id"]
          },
        ]
      }
      insurances: {
        Row: {
          annual_limit: number | null
          api_endpoint: string | null
          coverage_rate: number | null
          created_at: string | null
          data_format: string | null
          id: string
          name: string
          reimbursement_delay: number | null
          updated_at: string | null
        }
        Insert: {
          annual_limit?: number | null
          api_endpoint?: string | null
          coverage_rate?: number | null
          created_at?: string | null
          data_format?: string | null
          id?: string
          name: string
          reimbursement_delay?: number | null
          updated_at?: string | null
        }
        Update: {
          annual_limit?: number | null
          api_endpoint?: string | null
          coverage_rate?: number | null
          created_at?: string | null
          data_format?: string | null
          id?: string
          name?: string
          reimbursement_delay?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          expiry_date: string | null
          id: string
          min_stock: number | null
          name: string
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          min_stock?: number | null
          name: string
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          min_stock?: number | null
          name?: string
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          invoice_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          invoice_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          invoice_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_attachments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json
          patient_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          items: Json
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          consultation_id: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          laboratory_id: string | null
          patient_id: string | null
          preparation_instructions: string[] | null
          results: Json | null
          results_date: string | null
          status: string | null
          test_name: string
          test_type: string
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          laboratory_id?: string | null
          patient_id?: string | null
          preparation_instructions?: string[] | null
          results?: Json | null
          results_date?: string | null
          status?: string | null
          test_name: string
          test_type: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          laboratory_id?: string | null
          patient_id?: string | null
          preparation_instructions?: string[] | null
          results?: Json | null
          results_date?: string | null
          status?: string | null
          test_name?: string
          test_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_laboratory_id_fkey"
            columns: ["laboratory_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratories: {
        Row: {
          address: string | null
          api_endpoint: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          api_endpoint?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          api_endpoint?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_access_requests: {
        Row: {
          expires_at: string | null
          global_patient_id: string | null
          id: string
          owning_tenant_id: string | null
          request_reason: string | null
          requested_at: string | null
          requesting_tenant_id: string | null
          responded_at: string | null
          response_message: string | null
          status: string
        }
        Insert: {
          expires_at?: string | null
          global_patient_id?: string | null
          id?: string
          owning_tenant_id?: string | null
          request_reason?: string | null
          requested_at?: string | null
          requesting_tenant_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string
        }
        Update: {
          expires_at?: string | null
          global_patient_id?: string | null
          id?: string
          owning_tenant_id?: string | null
          request_reason?: string | null
          requested_at?: string | null
          requesting_tenant_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_access_requests_global_patient_id_fkey"
            columns: ["global_patient_id"]
            isOneToOne: false
            referencedRelation: "global_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_access_requests_owning_tenant_id_fkey"
            columns: ["owning_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_access_requests_requesting_tenant_id_fkey"
            columns: ["requesting_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_guardians: {
        Row: {
          created_at: string | null
          guardian_id: string | null
          id: string
          is_primary: boolean | null
          patient_id: string | null
          relationship_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id?: string | null
          id?: string
          is_primary?: boolean | null
          patient_id?: string | null
          relationship_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string | null
          id?: string
          is_primary?: boolean | null
          patient_id?: string | null
          relationship_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_guardians_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurances: {
        Row: {
          annual_limit: number | null
          coverage_rate: number | null
          created_at: string | null
          id: string
          insurance_id: string | null
          is_active: boolean | null
          patient_id: string | null
          policy_number: string
          updated_at: string | null
        }
        Insert: {
          annual_limit?: number | null
          coverage_rate?: number | null
          created_at?: string | null
          id?: string
          insurance_id?: string | null
          is_active?: boolean | null
          patient_id?: string | null
          policy_number: string
          updated_at?: string | null
        }
        Update: {
          annual_limit?: number | null
          coverage_rate?: number | null
          created_at?: string | null
          id?: string
          insurance_id?: string | null
          is_active?: boolean | null
          patient_id?: string | null
          policy_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_insurances_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "insurances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_tenant_access: {
        Row: {
          access_level: string
          consent_date: string | null
          consent_status: string
          created_at: string | null
          global_patient_id: string | null
          id: string
          local_patient_id: string | null
          tenant_id: string | null
        }
        Insert: {
          access_level?: string
          consent_date?: string | null
          consent_status?: string
          created_at?: string | null
          global_patient_id?: string | null
          id?: string
          local_patient_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          access_level?: string
          consent_date?: string | null
          consent_status?: string
          created_at?: string | null
          global_patient_id?: string | null
          id?: string
          local_patient_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_tenant_access_global_patient_id_fkey"
            columns: ["global_patient_id"]
            isOneToOne: false
            referencedRelation: "global_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tenant_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: string[] | null
          birth_certificate_number: string | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          gender: string | null
          id: string
          is_minor: boolean | null
          legal_guardian_consent: boolean | null
          num_secu_sociale: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allergies?: string[] | null
          birth_certificate_number?: string | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          id?: string
          is_minor?: boolean | null
          legal_guardian_consent?: boolean | null
          num_secu_sociale?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allergies?: string[] | null
          birth_certificate_number?: string | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          id?: string
          is_minor?: boolean | null
          legal_guardian_consent?: boolean | null
          num_secu_sociale?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string | null
          api_endpoint: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          api_endpoint?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          api_endpoint?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pharmacy_prescriptions: {
        Row: {
          availability_status: string | null
          created_at: string | null
          delivered_date: string | null
          id: string
          pharmacy_id: string | null
          prescription_id: string | null
          ready_date: string | null
          status: string | null
          substitutions: Json | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          created_at?: string | null
          delivered_date?: string | null
          id?: string
          pharmacy_id?: string | null
          prescription_id?: string | null
          ready_date?: string | null
          status?: string | null
          substitutions?: Json | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          created_at?: string | null
          delivered_date?: string | null
          id?: string
          pharmacy_id?: string | null
          prescription_id?: string | null
          ready_date?: string | null
          status?: string | null
          substitutions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_prescriptions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_prescriptions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          instructions: string | null
          medications: Json
          patient_id: string | null
          prescription_date: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          instructions?: string | null
          medications: Json
          patient_id?: string | null
          prescription_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          instructions?: string | null
          medications?: Json
          patient_id?: string | null
          prescription_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_doctor_requests: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          request_date: string | null
          response_date: string | null
          response_message: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          request_date?: string | null
          response_date?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          request_date?: string | null
          response_date?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_doctor_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "primary_doctor_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_doctors: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          patient_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "primary_doctors_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          structure_type: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          structure_type?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          structure_type?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_transmissions: {
        Row: {
          access_code: string
          consultation_id: string | null
          created_at: string | null
          expiry_date: string
          feedback_date: string | null
          id: string
          reason: string
          recipient_id: string | null
          recipient_type: string
          specialist_feedback: string | null
          status: string | null
          transmitted_elements: string[]
          updated_at: string | null
        }
        Insert: {
          access_code: string
          consultation_id?: string | null
          created_at?: string | null
          expiry_date: string
          feedback_date?: string | null
          id?: string
          reason: string
          recipient_id?: string | null
          recipient_type: string
          specialist_feedback?: string | null
          status?: string | null
          transmitted_elements: string[]
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          consultation_id?: string | null
          created_at?: string | null
          expiry_date?: string
          feedback_date?: string | null
          id?: string
          reason?: string
          recipient_id?: string | null
          recipient_type?: string
          specialist_feedback?: string | null
          status?: string | null
          transmitted_elements?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_transmissions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_transmissions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          product_id: string | null
          quantity: number
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          product_id?: string | null
          quantity: number
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_security_configs: {
        Row: {
          allowed_domains: string[] | null
          audit_enabled: boolean | null
          audit_retention_days: number | null
          auth_providers: string[] | null
          created_at: string | null
          encrypted_fields: string[] | null
          id: string
          ip_whitelist: string[] | null
          lockout_duration: number | null
          max_failed_attempts: number | null
          mfa_required: boolean | null
          mfa_types: string[] | null
          password_min_length: number | null
          password_require_numbers: boolean | null
          password_require_special_chars: boolean | null
          password_require_uppercase: boolean | null
          session_timeout: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_domains?: string[] | null
          audit_enabled?: boolean | null
          audit_retention_days?: number | null
          auth_providers?: string[] | null
          created_at?: string | null
          encrypted_fields?: string[] | null
          id?: string
          ip_whitelist?: string[] | null
          lockout_duration?: number | null
          max_failed_attempts?: number | null
          mfa_required?: boolean | null
          mfa_types?: string[] | null
          password_min_length?: number | null
          password_require_numbers?: boolean | null
          password_require_special_chars?: boolean | null
          password_require_uppercase?: boolean | null
          session_timeout?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_domains?: string[] | null
          audit_enabled?: boolean | null
          audit_retention_days?: number | null
          auth_providers?: string[] | null
          created_at?: string | null
          encrypted_fields?: string[] | null
          id?: string
          ip_whitelist?: string[] | null
          lockout_duration?: number | null
          max_failed_attempts?: number | null
          mfa_required?: boolean | null
          mfa_types?: string[] | null
          password_min_length?: number | null
          password_require_numbers?: boolean | null
          password_require_special_chars?: boolean | null
          password_require_uppercase?: boolean | null
          session_timeout?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_security_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          subdomain: string
          subscription_plan: string
          subscription_seats: number | null
          subscription_status: string
          subscription_valid_until: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          subdomain: string
          subscription_plan?: string
          subscription_seats?: number | null
          subscription_status?: string
          subscription_valid_until?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          subdomain?: string
          subscription_plan?: string
          subscription_seats?: number | null
          subscription_status?: string
          subscription_valid_until?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transmission_accesses: {
        Row: {
          access_date: string | null
          id: string
          ip_address: string
          transmission_id: string | null
          user_agent: string | null
        }
        Insert: {
          access_date?: string | null
          id?: string
          ip_address: string
          transmission_id?: string | null
          user_agent?: string | null
        }
        Update: {
          access_date?: string | null
          id?: string
          ip_address?: string
          transmission_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transmission_accesses_transmission_id_fkey"
            columns: ["transmission_id"]
            isOneToOne: false
            referencedRelation: "secure_transmissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_patient_unique_hash: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_birth_date: string
          p_ssn: string
        }
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_current_tenant: {
        Args: { tenant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
