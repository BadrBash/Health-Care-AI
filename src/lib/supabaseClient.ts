import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HeartRateLog {
  id: string;
  user_id: string;
  bpm: number;
  context: string;
  logged_at: string;
}

export interface StepLog {
  id: string;
  user_id: string;
  steps: number;
  distance_meters: number;
  calories: number;
  log_date: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface DailyGoals {
  id: string;
  user_id: string;
  step_goal: number;
  water_goal_ml: number;
  min_heart_rate: number;
  max_heart_rate: number;
  created_at: string;
  updated_at: string;
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
