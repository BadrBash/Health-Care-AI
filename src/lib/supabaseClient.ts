import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// On web, AsyncStorage's default export is the module object; on native it's
// the storage class. Wrap both in a minimal adapter Supabase can use.
const storageAdapter = {
  getItem: (key: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.getItem?.(key) ?? null
      : AsyncStorage.getItem(key),
  setItem: (key: string, value: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.setItem?.(key, value) ?? Promise.resolve()
      : AsyncStorage.setItem(key, value),
  removeItem: (key: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.removeItem?.(key) ?? Promise.resolve()
      : AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
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
