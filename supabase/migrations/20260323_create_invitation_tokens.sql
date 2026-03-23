-- Create invitation_tokens table for tracking pending invitations
CREATE TABLE IF NOT EXISTS public.invitation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_ids uuid[] NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now(),
  used_at timestamp
);

-- Create index on token for fast lookups
CREATE INDEX idx_invitation_tokens_token ON public.invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_user_id ON public.invitation_tokens(user_id);
CREATE INDEX idx_invitation_tokens_expires_at ON public.invitation_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see invitations sent to them
CREATE POLICY "Users see their invitations"
ON public.invitation_tokens FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid());

-- Policy: Only service role can insert/update
CREATE POLICY "Service role manages invitations"
ON public.invitation_tokens
TO service_role
USING (true)
WITH CHECK (true);
