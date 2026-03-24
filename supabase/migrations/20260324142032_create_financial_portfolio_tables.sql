/*
  # Financial Portfolio Consolidation Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text) - Client full name
      - `email` (text) - Client email address
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `institutions`
      - `id` (uuid, primary key)
      - `name` (text) - Financial institution name
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `positions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `institution` (text) - Institution name
      - `asset_name` (text) - Name of the asset
      - `asset_type` (text) - Type (stock, fund, bond, etc)
      - `amount` (numeric) - Value in currency
      - `quantity` (numeric) - Number of units
      - `date` (date) - Position date
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `documents`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `file_url` (text) - URL to uploaded file in storage
      - `created_at` (timestamptz) - Upload timestamp
    
    - `extracted_positions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `asset_name` (text) - Extracted asset name
      - `institution` (text) - Extracted institution name
      - `amount` (numeric) - Extracted value
      - `quantity` (numeric) - Extracted quantity
      - `asset_type` (text) - Extracted asset type
      - `confirmed` (boolean) - Whether position is confirmed
      - `created_at` (timestamptz) - Extraction timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  institution text NOT NULL,
  asset_name text NOT NULL,
  asset_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS extracted_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  asset_name text NOT NULL,
  institution text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 0,
  asset_type text NOT NULL,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert institutions"
  ON institutions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view positions"
  ON positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert positions"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update positions"
  ON positions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete positions"
  ON positions FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view extracted_positions"
  ON extracted_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert extracted_positions"
  ON extracted_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update extracted_positions"
  ON extracted_positions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete extracted_positions"
  ON extracted_positions FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_positions_client_id ON positions(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_extracted_positions_document_id ON extracted_positions(document_id);