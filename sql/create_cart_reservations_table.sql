-- Sepet rezervasyonları için tablo
CREATE TABLE IF NOT EXISTS cart_reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seat_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  row_letter TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, seat_id, event_id)
);

-- Index for performance
CREATE INDEX idx_cart_reservations_user_id ON cart_reservations(user_id);
CREATE INDEX idx_cart_reservations_expires_at ON cart_reservations(expires_at);
CREATE INDEX idx_cart_reservations_user_event ON cart_reservations(user_id, event_id);

-- RLS Policies
ALTER TABLE cart_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart reservations"
  ON cart_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart reservations"
  ON cart_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart reservations"
  ON cart_reservations FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  -- Delete expired reservations
  DELETE FROM cart_reservations
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to run cleanup periodically
-- Note: This requires pg_cron extension, which may not be available on all Supabase plans
-- COMMENT: If pg_cron is available, uncomment the following:
-- SELECT cron.schedule('cleanup-expired-reservations', '*/5 * * * *', 'SELECT cleanup_expired_reservations()');
