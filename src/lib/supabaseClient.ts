import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as AsyncLocalStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncLocalStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
