import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string | null;
  patient_name: string;
  doctor_id: string | null;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string | null;
  patient_name: string;
  doctor_id: string | null;
  doctor_name: string;
  record_date: string;
  type: string;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  created_at: string;
}

export interface DiagnosisResult {
  condition: string;
  probability: number;
  severity: string;
  description: string;
  recommendations: string[];
}

export interface Diagnosis {
  id: string;
  patient_name: string;
  symptoms: string;
  duration: string | null;
  severity: string | null;
  results: DiagnosisResult[] | null;
  status: string;
  diagnosis_date: string;
  created_at: string;
}

export interface VitalSign {
  id: string;
  patient_id: string | null;
  patient_name: string;
  blood_pressure: string | null;
  heart_rate: string | null;
  temperature: string | null;
  oxygen_saturation: string | null;
  status: string;
  recorded_at: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  license: string;
  experience: string;
  notifications: {
    appointments: boolean;
    reminders: boolean;
    reports: boolean;
    updates: boolean;
  };
  updated_at: string;
}
