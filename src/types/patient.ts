
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  email?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: MedicalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes?: string;
  prescriptions: Prescription[];
  followUpDate?: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribed_date: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  ticketCode?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  speciality: string;
  phone: string;
  email: string;
  schedule: DoctorSchedule[];
  consultationFee: number;
}

export interface DoctorSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  slotDuration: number; // in minutes
}
