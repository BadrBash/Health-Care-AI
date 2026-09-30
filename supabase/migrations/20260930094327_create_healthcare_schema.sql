/*
# HealthCare AI — Initial Database Schema

1. Purpose
   Replace hardcoded mock data with a persistent backend for a healthcare
   management app. Stores doctors, patients, appointments, medical records,
   AI-assisted diagnoses, vital signs, and a doctor profile — all read/written
   from the frontend via the Supabase anon-key client.

2. New Tables
   - `doctors` — doctor directory (name, specialization, etc.)
   - `patients` — patient directory (name, date of birth, contact)
   - `appointments` — scheduled visits linking patient + doctor + type + status
   - `medical_records` — clinical notes, diagnosis, prescription per visit
   - `diagnoses` — AI-assisted symptom analysis results
   - `vital_signs` — patient vitals (BP, heart rate, temperature, SpO2)
   - `profile` — single-row doctor profile/settings (name, email, phone, specialization, license, experience, notification prefs)

3. Security
   Single-tenant app (no sign-in). RLS enabled on every table with
   TO anon, authenticated CRUD policies so the anon-key frontend can operate.

4. Notes
   - All tables use gen_random_uuid() for primary keys.
   - created_at/updated_at timestamps default to now().
*/

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL DEFAULT 'Internal Medicine',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctors" ON doctors;
CREATE POLICY "anon_select_doctors" ON doctors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_doctors" ON doctors;
CREATE POLICY "anon_insert_doctors" ON doctors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_doctors" ON doctors;
CREATE POLICY "anon_update_doctors" ON doctors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_doctors" ON doctors;
CREATE POLICY "anon_delete_doctors" ON doctors FOR DELETE TO anon, authenticated USING (true);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_of_birth date,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patients" ON patients;
CREATE POLICY "anon_select_patients" ON patients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
CREATE POLICY "anon_insert_patients" ON patients FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_patients" ON patients;
CREATE POLICY "anon_update_patients" ON patients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
CREATE POLICY "anon_delete_patients" ON patients FOR DELETE TO anon, authenticated USING (true);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  type text NOT NULL DEFAULT 'Check-up',
  status text NOT NULL DEFAULT 'upcoming',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE TO anon, authenticated USING (true);

-- Medical records
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name text NOT NULL,
  record_date date NOT NULL,
  type text NOT NULL DEFAULT 'Consultation',
  diagnosis text,
  prescription text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medical_records" ON medical_records;
CREATE POLICY "anon_select_medical_records" ON medical_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_medical_records" ON medical_records;
CREATE POLICY "anon_insert_medical_records" ON medical_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_medical_records" ON medical_records;
CREATE POLICY "anon_update_medical_records" ON medical_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_medical_records" ON medical_records;
CREATE POLICY "anon_delete_medical_records" ON medical_records FOR DELETE TO anon, authenticated USING (true);

-- Diagnoses (AI-assisted)
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  symptoms text NOT NULL,
  duration text,
  severity text,
  results jsonb,
  status text NOT NULL DEFAULT 'Under Review',
  diagnosis_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_diagnoses" ON diagnoses;
CREATE POLICY "anon_select_diagnoses" ON diagnoses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_diagnoses" ON diagnoses;
CREATE POLICY "anon_insert_diagnoses" ON diagnoses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_diagnoses" ON diagnoses;
CREATE POLICY "anon_update_diagnoses" ON diagnoses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_diagnoses" ON diagnoses;
CREATE POLICY "anon_delete_diagnoses" ON diagnoses FOR DELETE TO anon, authenticated USING (true);

-- Vital signs
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  blood_pressure text,
  heart_rate text,
  temperature text,
  oxygen_saturation text,
  status text NOT NULL DEFAULT 'normal',
  recorded_at timestamptz DEFAULT now()
);
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vital_signs" ON vital_signs;
CREATE POLICY "anon_select_vital_signs" ON vital_signs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_vital_signs" ON vital_signs;
CREATE POLICY "anon_insert_vital_signs" ON vital_signs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_vital_signs" ON vital_signs;
CREATE POLICY "anon_update_vital_signs" ON vital_signs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_vital_signs" ON vital_signs;
CREATE POLICY "anon_delete_vital_signs" ON vital_signs FOR DELETE TO anon, authenticated USING (true);

-- Profile (single doctor profile/settings)
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Dr. Sarah Wilson',
  email text NOT NULL DEFAULT 'sarah.wilson@healthcare.com',
  phone text NOT NULL DEFAULT '+1 (555) 123-4567',
  specialization text NOT NULL DEFAULT 'Internal Medicine',
  license text NOT NULL DEFAULT 'MD-123456',
  experience text NOT NULL DEFAULT '12 years',
  notifications jsonb NOT NULL DEFAULT '{"appointments": true, "reminders": true, "reports": false, "updates": true}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profile" ON profile;
CREATE POLICY "anon_select_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
CREATE POLICY "anon_insert_profile" ON profile FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
CREATE POLICY "anon_update_profile" ON profile FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;
CREATE POLICY "anon_delete_profile" ON profile FOR DELETE TO anon, authenticated USING (true);
