-- Create consultores table and link clients via cpf_consultor

-- 1) Consultores profile table
CREATE TABLE IF NOT EXISTS consultores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;

-- Allow public access (the app currently doesn't enforce auth on the client side yet)
DROP POLICY IF EXISTS "Public read access" ON consultores;
DROP POLICY IF EXISTS "Public insert access" ON consultores;
DROP POLICY IF EXISTS "Public update access" ON consultores;
DROP POLICY IF EXISTS "Public delete access" ON consultores;

CREATE POLICY "Public read access" ON consultores FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON consultores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON consultores FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON consultores FOR DELETE USING (true);

-- 2) Add cpf_consultor to clients and reference consultores.cpf
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf_consultor text;

-- Add FK constraint safely (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clients_cpf_consultor_fkey'
  ) THEN
    ALTER TABLE clients
      ADD CONSTRAINT clients_cpf_consultor_fkey
      FOREIGN KEY (cpf_consultor)
      REFERENCES consultores(cpf)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_cpf_consultor ON clients(cpf_consultor);

