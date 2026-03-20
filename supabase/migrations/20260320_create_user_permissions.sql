-- Create user_permissions table
CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_email TEXT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{"termine": false, "fahrten": false, "dokumente": false}'::jsonb,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (valid_until IS NULL OR valid_until > valid_from),
  CONSTRAINT valid_permissions CHECK (
    permissions ? 'termine' AND
    permissions ? 'fahrten' AND
    permissions ? 'dokumente'
  )
);

-- Create indexes
CREATE INDEX idx_user_permissions_owner_id ON user_permissions(owner_id);
CREATE INDEX idx_user_permissions_guest_email ON user_permissions(guest_email);
CREATE INDEX idx_user_permissions_vehicle_id ON user_permissions(vehicle_id);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- 1. Owners can see their own shared permissions
CREATE POLICY "Owners can view their shared permissions"
  ON user_permissions FOR SELECT
  USING (auth.uid() = owner_id);

-- 2. Guests can see permissions shared with their email
CREATE POLICY "Guests can view their permissions"
  ON user_permissions FOR SELECT
  USING (guest_email = auth.jwt() ->> 'email');

-- 3. Only owners can create permissions for their vehicles
CREATE POLICY "Owners can create permissions"
  ON user_permissions FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    (vehicle_id IS NULL OR EXISTS (
      SELECT 1 FROM vehicles WHERE id = vehicle_id AND user_id = auth.uid()
    ))
  );

-- 4. Only owners can update their permissions
CREATE POLICY "Owners can update permissions"
  ON user_permissions FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5. Only owners can delete permissions
CREATE POLICY "Owners can delete permissions"
  ON user_permissions FOR DELETE
  USING (auth.uid() = owner_id);
