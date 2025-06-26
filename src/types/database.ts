
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin' | 'agent';
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialty_id?: string;
  license_number?: string;
  consultation_fee: number;
  availability_status: 'available' | 'busy' | 'offline';
  created_at: string;
  updated_at: string;
  specialty?: Specialty;
  profile?: Profile;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: 'consultation' | 'suivi' | 'urgence' | 'teleconsultation';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  payment_method?: 'mobile_money' | 'cash' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  symptoms?: string;
  diagnosis?: string;
  treatment_plan?: string;
  vitals?: {
    blood_pressure?: string;
    weight?: string;
    temperature?: string;
    heart_rate?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  prescription_date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  instructions?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medication' | 'equipment' | 'supplies';
  description?: string;
  current_stock: number;
  min_stock: number;
  unit_price: number;
  expiry_date?: string;
  supplier?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'entrée' | 'sortie';
  quantity: number;
  reason?: string;
  user_id?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  created_at: string;
  updated_at: string;
}
