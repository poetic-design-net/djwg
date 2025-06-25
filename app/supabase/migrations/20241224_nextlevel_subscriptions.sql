-- NextLevel DJs Subscriptions Table
CREATE TYPE subscription_status AS ENUM (
  'incomplete',
  'incomplete_expired', 
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused'
);

CREATE TYPE subscription_plan AS ENUM (
  'monthly',
  'quarterly', 
  'yearly'
);

CREATE TABLE nextlevel_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_nextlevel_subscriptions_user_id ON nextlevel_subscriptions(user_id);
CREATE INDEX idx_nextlevel_subscriptions_stripe_subscription_id ON nextlevel_subscriptions(stripe_subscription_id);
CREATE INDEX idx_nextlevel_subscriptions_status ON nextlevel_subscriptions(status);
CREATE INDEX idx_nextlevel_subscriptions_plan_type ON nextlevel_subscriptions(plan_type);

-- RLS Policies
ALTER TABLE nextlevel_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON nextlevel_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only the system can insert/update subscriptions (via service role)
CREATE POLICY "System can manage subscriptions" ON nextlevel_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Download History Table für Musik-Downloads
CREATE TABLE nextlevel_download_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  UNIQUE(user_id, file_path, download_date)
);

-- Indexes
CREATE INDEX idx_nextlevel_download_history_user_id ON nextlevel_download_history(user_id);
CREATE INDEX idx_nextlevel_download_history_download_date ON nextlevel_download_history(download_date);

-- RLS
ALTER TABLE nextlevel_download_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own download history" ON nextlevel_download_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage download history" ON nextlevel_download_history
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_nextlevel_subscriptions_updated_at
  BEFORE UPDATE ON nextlevel_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();