-- Fix policy_vehicles RLS Policies

-- Disable RLS temporarily to fix policies
ALTER TABLE policy_vehicles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own policy_vehicles" ON policy_vehicles;
DROP POLICY IF EXISTS "Users can insert their own policy_vehicles" ON policy_vehicles;
DROP POLICY IF EXISTS "Users can update their own policy_vehicles" ON policy_vehicles;
DROP POLICY IF EXISTS "Users can delete their own policy_vehicles" ON policy_vehicles;

-- Re-enable RLS
ALTER TABLE policy_vehicles ENABLE ROW LEVEL SECURITY;

-- Create new RLS Policies for policy_vehicles
-- Policy 1: Users can view policy_vehicles for their own vehicles
CREATE POLICY "Users can view policy_vehicles for their vehicles"
  ON policy_vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = policy_vehicles.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Policy 2: Users can insert policy_vehicles for their own vehicles
CREATE POLICY "Users can insert policy_vehicles for their vehicles"
  ON policy_vehicles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = policy_vehicles.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Policy 3: Users can update policy_vehicles for their own vehicles
CREATE POLICY "Users can update policy_vehicles for their vehicles"
  ON policy_vehicles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = policy_vehicles.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = policy_vehicles.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Policy 4: Users can delete policy_vehicles for their own vehicles
CREATE POLICY "Users can delete policy_vehicles for their vehicles"
  ON policy_vehicles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = policy_vehicles.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Ensure insurance_policies RLS is also correct
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own insurance_policies" ON insurance_policies;
DROP POLICY IF EXISTS "Users can insert their own insurance_policies" ON insurance_policies;
DROP POLICY IF EXISTS "Users can update their own insurance_policies" ON insurance_policies;
DROP POLICY IF EXISTS "Users can delete their own insurance_policies" ON insurance_policies;

-- Create new policies for insurance_policies
CREATE POLICY "Users can view their insurance_policies"
  ON insurance_policies FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert insurance_policies"
  ON insurance_policies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update insurance_policies"
  ON insurance_policies FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete insurance_policies"
  ON insurance_policies FOR DELETE
  USING (user_id = auth.uid());
