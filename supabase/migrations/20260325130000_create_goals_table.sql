-- Create goals table for client financial objectives

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  monthly_contribution numeric NOT NULL DEFAULT 0,
  expected_annual_return numeric NOT NULL DEFAULT 10,
  deadline date,
  category text NOT NULL DEFAULT 'outros',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage goals"
  ON goals FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_goals_client_id ON goals(client_id);
