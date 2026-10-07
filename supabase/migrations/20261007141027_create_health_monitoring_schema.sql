/*
# Health Monitoring App — New Schema

1. Purpose
   Replaces the old healthcare management tables with health monitoring
   tables: heart rate logs, step logs, water intake logs, and daily goals.
   All data is user-scoped (requires authentication).

2. New Tables
   - `heart_rate_logs` — BPM readings with timestamp and optional context
   - `step_logs` — daily step counts with distance and calories
   - `water_logs` — individual water intake entries (glasses or ml)
   - `daily_goals` — per-user daily targets for steps, water, heart rate zones

3. Security
   All tables use owner-scoped RLS (TO authenticated, auth.uid() = user_id).
   user_id columns default to auth.uid() so inserts from the client work
   without explicitly passing the owner.

4. Notes
   - Old tables (doctors, patients, appointments, medical_records, diagnoses,
     vital_signs, profile) still exist with their user_id columns and
     owner-scoped policies from the previous migration. They are unused by
     the new app but left in place to avoid data loss.
*/

-- Heart rate logs
CREATE TABLE IF NOT EXISTS heart_rate_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bpm integer NOT NULL,
  context text DEFAULT 'resting',
  logged_at timestamptz DEFAULT now()
);
ALTER TABLE heart_rate_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_heart_rate" ON heart_rate_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_heart_rate" ON heart_rate_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_heart_rate" ON heart_rate_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_heart_rate" ON heart_rate_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Step logs (daily)
CREATE TABLE IF NOT EXISTS step_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  steps integer NOT NULL DEFAULT 0,
  distance_meters numeric DEFAULT 0,
  calories integer DEFAULT 0,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE step_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_steps" ON step_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_steps" ON step_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_steps" ON step_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_steps" ON step_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Water intake logs
CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL DEFAULT 250,
  logged_at timestamptz DEFAULT now()
);
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_water" ON water_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_water" ON water_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_water" ON water_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_water" ON water_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Daily goals (per user)
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  step_goal integer NOT NULL DEFAULT 10000,
  water_goal_ml integer NOT NULL DEFAULT 2000,
  min_heart_rate integer NOT NULL DEFAULT 60,
  max_heart_rate integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_goals" ON daily_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_goals" ON daily_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_goals" ON daily_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_goals" ON daily_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
