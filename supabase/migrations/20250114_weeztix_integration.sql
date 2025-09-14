-- Create weeztix_orders table to track ticket purchases
CREATE TABLE IF NOT EXISTS public.weeztix_orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_guid text UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text NOT NULL,
    customer_firstname text,
    customer_lastname text,
    ticket_guid text,
    reservation_guid text,
    event_date_guid text,
    product_guid text,
    purchase_date timestamptz DEFAULT now(),
    webhook_data jsonb,
    badge_assigned boolean DEFAULT false,
    badge_assigned_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_weeztix_orders_user_id ON public.weeztix_orders(user_id);
CREATE INDEX idx_weeztix_orders_user_email ON public.weeztix_orders(user_email);
CREATE INDEX idx_weeztix_orders_order_guid ON public.weeztix_orders(order_guid);
CREATE INDEX idx_weeztix_orders_badge_assigned ON public.weeztix_orders(badge_assigned);

-- Enable RLS
ALTER TABLE public.weeztix_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own orders"
    ON public.weeztix_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON public.weeztix_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert orders"
    ON public.weeztix_orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update orders"
    ON public.weeztix_orders FOR UPDATE
    USING (true);

-- Function to automatically assign badge when order is created
CREATE OR REPLACE FUNCTION assign_weeztix_badge()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if badge not already assigned and user_id is present
    IF NEW.badge_assigned = false AND NEW.user_id IS NOT NULL THEN
        -- Get badge ID from environment or use a default
        -- Note: In production, this should be configured properly
        DECLARE
            badge_id uuid;
        BEGIN
            -- You'll need to set the actual badge ID here
            -- This is a placeholder that should be replaced with the actual badge ID
            badge_id := NULL; -- Will be set via environment variable

            IF badge_id IS NOT NULL THEN
                -- Insert badge assignment (ignore if already exists)
                INSERT INTO public.user_badges (user_id, badge_id, assigned_at, assigned_reason)
                VALUES (
                    NEW.user_id,
                    badge_id,
                    now(),
                    'Weeztix Ticket Purchase - Order: ' || NEW.order_guid
                )
                ON CONFLICT (user_id, badge_id) DO NOTHING;

                -- Update order to mark badge as assigned
                NEW.badge_assigned := true;
                NEW.badge_assigned_at := now();
            END IF;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic badge assignment
CREATE TRIGGER trigger_assign_weeztix_badge
    BEFORE INSERT OR UPDATE ON public.weeztix_orders
    FOR EACH ROW
    EXECUTE FUNCTION assign_weeztix_badge();

-- Function to match user by email and update user_id
CREATE OR REPLACE FUNCTION match_weeztix_user()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is null, try to match by email
    IF NEW.user_id IS NULL AND NEW.user_email IS NOT NULL THEN
        SELECT id INTO NEW.user_id
        FROM auth.users
        WHERE email = LOWER(NEW.user_email)
        LIMIT 1;
    END IF;

    -- Update the updated_at timestamp
    NEW.updated_at := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to match user by email
CREATE TRIGGER trigger_match_weeztix_user
    BEFORE INSERT OR UPDATE ON public.weeztix_orders
    FOR EACH ROW
    EXECUTE FUNCTION match_weeztix_user();