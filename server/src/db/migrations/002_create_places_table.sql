-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100) NOT NULL,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_places_city_id ON places(city_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
-- PostGIS spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);

