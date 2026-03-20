-- Create vehicle_drives table
CREATE TABLE vehicle_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kilometers INTEGER NOT NULL CHECK (kilometers >= 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicle_drives ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Users can only access their own drives
CREATE POLICY "Users can manage own drives"
  ON vehicle_drives FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_vehicle_drives_vehicle_id ON vehicle_drives(vehicle_id);
CREATE INDEX idx_vehicle_drives_user_id ON vehicle_drives(user_id);
CREATE INDEX idx_vehicle_drives_date ON vehicle_drives(date DESC);
