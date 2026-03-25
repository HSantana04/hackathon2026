-- Add CPF to clients and client_id FK to extracted_positions

-- 1. Add CPF column to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf text;
CREATE UNIQUE INDEX IF NOT EXISTS clients_cpf_unique ON clients(cpf) WHERE cpf IS NOT NULL;

-- 2. Add client_id FK to extracted_positions for direct association
ALTER TABLE extracted_positions ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_extracted_positions_client_id ON extracted_positions(client_id);
