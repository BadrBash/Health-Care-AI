/*
# Add user-scoped ownership to all tables

1. Changes
   - Adds `user_id uuid` column to: appointments, medical_records, diagnoses,
     vital_signs, profile, patients, doctors.
   - Sets DEFAULT auth.uid() on all user_id columns so inserts that omit
     user_id are automatically attributed to the signed-in user.
   - Drops all existing anon-access policies and replaces them with
     owner-scoped policies (TO authenticated, auth.uid() = user_id).

2. Security
   - All tables now require authentication. Only the owning user can
     SELECT, INSERT, UPDATE, DELETE their own rows.
   - The old single-tenant anon policies are removed.

3. Notes
   - Old demo seed data was cleared before this migration.
   - Each new user starts with a fresh, empty workspace.
*/

-- appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- medical_records
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_medical_records" ON medical_records;
DROP POLICY IF EXISTS "anon_insert_medical_records" ON medical_records;
DROP POLICY IF EXISTS "anon_update_medical_records" ON medical_records;
DROP POLICY IF EXISTS "anon_delete_medical_records" ON medical_records;
CREATE POLICY "select_own_medical_records" ON medical_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_medical_records" ON medical_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_medical_records" ON medical_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_medical_records" ON medical_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- diagnoses
ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "anon_insert_diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "anon_update_diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "anon_delete_diagnoses" ON diagnoses;
CREATE POLICY "select_own_diagnoses" ON diagnoses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_diagnoses" ON diagnoses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_diagnoses" ON diagnoses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_diagnoses" ON diagnoses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- vital_signs
ALTER TABLE vital_signs ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "anon_insert_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "anon_update_vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "anon_delete_vital_signs" ON vital_signs;
CREATE POLICY "select_own_vital_signs" ON vital_signs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_vital_signs" ON vital_signs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_vital_signs" ON vital_signs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_vital_signs" ON vital_signs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profile
ALTER TABLE profile ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_profile" ON profile;
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;
CREATE POLICY "select_own_profile" ON profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profile" ON profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON profile FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_profile" ON profile FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_patients" ON patients;
DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
DROP POLICY IF EXISTS "anon_update_patients" ON patients;
DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
CREATE POLICY "select_own_patients" ON patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_patients" ON patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_patients" ON patients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_patients" ON patients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "anon_select_doctors" ON doctors;
DROP POLICY IF EXISTS "anon_insert_doctors" ON doctors;
DROP POLICY IF EXISTS "anon_update_doctors" ON doctors;
DROP POLICY IF EXISTS "anon_delete_doctors" ON doctors;
CREATE POLICY "select_own_doctors" ON doctors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_doctors" ON doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_doctors" ON doctors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_doctors" ON doctors FOR DELETE TO authenticated USING (auth.uid() = user_id);
