-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon_url) VALUES
  ('Hotspot Explorer', 'Visit 5 red (high popularity) areas on the heatmap', 'https://example.com/icons/hotspot-explorer.png'),
  ('City Wanderer', 'Check in at 10 different places', 'https://example.com/icons/city-wanderer.png'),
  ('Early Bird', 'Check in before 8 AM', 'https://example.com/icons/early-bird.png'),
  ('Night Owl', 'Check in after 10 PM', 'https://example.com/icons/night-owl.png')
ON CONFLICT (name) DO NOTHING;

