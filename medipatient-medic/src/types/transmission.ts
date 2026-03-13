
export interface SecureTransmission {
  id: string;
  consultation_id: string;
  recipient_id: string;
  recipient_type: 'specialist' | 'laboratory' | 'doctor';
  access_code: string;
  expiry_date: string;
  transmitted_elements: string[];
  reason: string;
  status: 'active' | 'accessed' | 'expired' | 'completed';
  specialist_feedback?: string;
  feedback_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TransmissionAccess {
  id: string;
  transmission_id: string;
  access_date: string;
  ip_address: string;
  user_agent?: string;
}

export interface TransmissionCreate {
  consultation_id: string;
  recipient_id: string;
  recipient_type: 'specialist' | 'laboratory' | 'doctor';
  transmitted_elements: string[];
  reason: string;
  validity_hours?: number;
}
