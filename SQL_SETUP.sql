-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_vehicles junction table
CREATE TABLE IF NOT EXISTS policy_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(policy_id, vehicle_id)
);

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS policies for insurance_policies
CREATE POLICY "Users can view their own insurance policies"
  ON insurance_policies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insurance policies"
  ON insurance_policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies"
  ON insurance_policies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies"
  ON insurance_policies
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for policy_vehicles
CREATE POLICY "Users can view policy_vehicles for their policies"
  ON policy_vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM insurance_policies
      WHERE id = policy_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert policy_vehicles for their policies"
  ON policy_vehicles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM insurance_policies
      WHERE id = policy_id AND user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE id = vehicle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete policy_vehicles for their policies"
  ON policy_vehicles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM insurance_policies
      WHERE id = policy_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_vehicles_policy_id ON policy_vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_vehicles_vehicle_id ON policy_vehicles(vehicle_id);
