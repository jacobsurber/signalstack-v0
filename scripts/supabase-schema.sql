-- User management and preferences
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free'
);

-- Stock recommendations tracking
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ticker TEXT NOT NULL,
  company_name TEXT,
  entry_price DECIMAL(10,2),
  target_price DECIMAL(10,2),
  stop_loss_price DECIMAL(10,2),
  risk_reward_ratio DECIMAL(5,2),
  timeframe TEXT,
  rationale TEXT,
  tags TEXT[],
  probability_of_success INTEGER,
  volatility_profile TEXT,
  discovery_method TEXT,
  catalyst_type TEXT,
  risk_appetite TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, hit_target, hit_stop, expired
  actual_performance JSONB
);

-- User watchlists
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  tickers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE performance_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID REFERENCES recommendations(id),
  ticker TEXT NOT NULL,
  check_date DATE,
  current_price DECIMAL(10,2),
  current_return_pct DECIMAL(8,4),
  days_held INTEGER,
  status TEXT, -- winning, losing, neutral
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market insights and patterns
CREATE TABLE market_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT, -- pattern, regime_change, sector_rotation
  title TEXT,
  description TEXT,
  data JSONB,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User sessions and analytics
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_data JSONB,
  searches_count INTEGER DEFAULT 0,
  recommendations_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_ticker ON recommendations(ticker);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at);
CREATE INDEX idx_performance_tracking_ticker ON performance_tracking(ticker);
CREATE INDEX idx_performance_tracking_date ON performance_tracking(check_date);
