-- Create vehicle_tires table
CREATE TABLE vehicle_tires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('summer', 'winter', 'allseason')),
  size TEXT NOT NULL,
  purchase_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicle_tires ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Users can only access their own tires
CREATE POLICY "Users can manage own tires"
  ON vehicle_tires FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_vehicle_tires_vehicle_id ON vehicle_tires(vehicle_id);
CREATE INDEX idx_vehicle_tires_user_id ON vehicle_tires(user_id);
