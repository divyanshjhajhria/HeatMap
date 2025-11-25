-- Create chat rooms table (location-based chat rooms)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  radius_meters INTEGER DEFAULT 500, -- Proximity radius in meters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_chat_rooms junction table (users in chat rooms)
CREATE TABLE IF NOT EXISTS user_chat_rooms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP,
  UNIQUE(user_id, chat_room_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_chat_rooms_user_id ON user_chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_rooms_chat_room_id ON user_chat_rooms(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_place_id ON chat_rooms(place_id);

-- Create spatial index for proximity queries
CREATE INDEX IF NOT EXISTS idx_chat_rooms_location ON chat_rooms USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);

