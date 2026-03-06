-- Add created_by to organizations (referenced by AuthContext on sign-up)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

COMMENT ON COLUMN organizations.created_by IS 'User who created the organization (set on sign-up).';
