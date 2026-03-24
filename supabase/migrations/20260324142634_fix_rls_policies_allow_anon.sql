/*
  # Fix RLS Policies to Allow Anonymous Access

  The application does not implement authentication, so RLS policies
  need to allow anonymous users to access all tables.
  
  Changes:
  - Drop existing restrictive policies
  - Create new permissive policies for public access
*/

DROP POLICY IF EXISTS "Anyone can view clients" ON clients;
DROP POLICY IF EXISTS "Anyone can insert clients" ON clients;
DROP POLICY IF EXISTS "Anyone can update clients" ON clients;
DROP POLICY IF EXISTS "Anyone can delete clients" ON clients;

DROP POLICY IF EXISTS "Anyone can view institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can insert institutions" ON institutions;

DROP POLICY IF EXISTS "Anyone can view positions" ON positions;
DROP POLICY IF EXISTS "Anyone can insert positions" ON positions;
DROP POLICY IF EXISTS "Anyone can update positions" ON positions;
DROP POLICY IF EXISTS "Anyone can delete positions" ON positions;

DROP POLICY IF EXISTS "Anyone can view documents" ON documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON documents;

DROP POLICY IF EXISTS "Anyone can view extracted_positions" ON extracted_positions;
DROP POLICY IF EXISTS "Anyone can insert extracted_positions" ON extracted_positions;
DROP POLICY IF EXISTS "Anyone can update extracted_positions" ON extracted_positions;
DROP POLICY IF EXISTS "Anyone can delete extracted_positions" ON extracted_positions;

-- Create new permissive policies for public access
CREATE POLICY "Public read access" ON clients FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON clients FOR DELETE USING (true);

CREATE POLICY "Public read access" ON institutions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON institutions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access" ON positions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON positions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON positions FOR DELETE USING (true);

CREATE POLICY "Public read access" ON documents FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete access" ON documents FOR DELETE USING (true);

CREATE POLICY "Public read access" ON extracted_positions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON extracted_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON extracted_positions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON extracted_positions FOR DELETE USING (true);
