export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      patients: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          gender: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          gender?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          updated_at?: string | null
        }
        Relationships: []
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
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
