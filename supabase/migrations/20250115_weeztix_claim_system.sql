-- Add claim system columns to weeztix_orders
ALTER TABLE public.weeztix_orders
ADD COLUMN IF NOT EXISTS claim_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS claim_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claim_email_sent_at TIMESTAMPTZ;

-- Index for faster claim code lookups
CREATE INDEX IF NOT EXISTS idx_weeztix_orders_claim_code
ON public.weeztix_orders(claim_code)
WHERE claim_code IS NOT NULL;

-- Index for finding unclaimed orders by email
CREATE INDEX IF NOT EXISTS idx_weeztix_orders_unclaimed
ON public.weeztix_orders(user_email, user_id)
WHERE user_id IS NULL;

-- Function to auto-claim orders on user registration
CREATE OR REPLACE FUNCTION auto_claim_weeztix_orders()
RETURNS TRIGGER AS $$
DECLARE
  unclaimed_order RECORD;
  badge_id UUID;
BEGIN
  -- Get the badge ID from app metadata or environment
  badge_id := '319b8937-cc53-4b1c-a2ef-b9f97aa81f51'::UUID;

  -- Find all unclaimed orders for this email
  FOR unclaimed_order IN
    SELECT * FROM public.weeztix_orders
    WHERE LOWER(user_email) = LOWER(NEW.email)
    AND user_id IS NULL
    AND badge_assigned = FALSE
  LOOP
    -- Update order with user ID
    UPDATE public.weeztix_orders
    SET
      user_id = NEW.id,
      claimed_at = NOW()
    WHERE id = unclaimed_order.id;

    -- Assign badge if not already assigned
    INSERT INTO public.user_badges (user_id, badge_id, assigned_at, assigned_reason)
    VALUES (
      NEW.id,
      badge_id,
      NOW(),
      'Weeztix Ticket Purchase - Order: ' || unclaimed_order.order_guid
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- Mark order as badge assigned
    UPDATE public.weeztix_orders
    SET
      badge_assigned = TRUE,
      badge_assigned_at = NOW()
    WHERE id = unclaimed_order.id;

    -- Log the auto-claim
    RAISE NOTICE 'Auto-claimed Weeztix order % for user %', unclaimed_order.order_guid, NEW.email;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user registration (auth.users insert)
CREATE TRIGGER auto_claim_on_registration
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_claim_weeztix_orders();

-- Trigger on email confirmation/verification
CREATE TRIGGER auto_claim_on_email_confirmed
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION auto_claim_weeztix_orders();

-- View for unclaimed orders (useful for admin dashboard)
CREATE OR REPLACE VIEW public.weeztix_unclaimed_orders AS
SELECT
  wo.*,
  COUNT(*) OVER (PARTITION BY wo.user_email) as unclaimed_count_for_email
FROM public.weeztix_orders wo
WHERE wo.user_id IS NULL
AND wo.badge_assigned = FALSE
ORDER BY wo.created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON public.weeztix_unclaimed_orders TO authenticated;

COMMENT ON COLUMN public.weeztix_orders.claim_code IS 'Unique code for manual ticket claiming';
COMMENT ON COLUMN public.weeztix_orders.claimed_at IS 'Timestamp when order was claimed by a user';
COMMENT ON COLUMN public.weeztix_orders.claim_email_sent IS 'Whether claim instructions were sent via email';
COMMENT ON FUNCTION auto_claim_weeztix_orders() IS 'Automatically claims Weeztix orders when users register with matching email';