-- Create table for storing Weeztix OAuth tokens
CREATE TABLE IF NOT EXISTS public.weeztix_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.weeztix_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens
CREATE POLICY "Service role only" ON public.weeztix_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_weeztix_tokens_updated_at
  BEFORE UPDATE ON public.weeztix_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_weeztix_tokens_expires_at ON public.weeztix_tokens(expires_at);

-- Add comment
COMMENT ON TABLE public.weeztix_tokens IS 'Stores OAuth2 tokens for Weeztix API access';
COMMENT ON COLUMN public.weeztix_tokens.id IS 'Token identifier (default for single tenant, or user-specific for multi-tenant)';
COMMENT ON COLUMN public.weeztix_tokens.access_token IS 'OAuth2 access token for API requests';
COMMENT ON COLUMN public.weeztix_tokens.refresh_token IS 'OAuth2 refresh token for renewing access';
COMMENT ON COLUMN public.weeztix_tokens.expires_at IS 'Token expiration timestamp';