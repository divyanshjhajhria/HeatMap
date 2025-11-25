-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on city name for faster lookups
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Insert default city (Paris) for testing
INSERT INTO cities (name, country, lat, lng) 
VALUES ('Paris', 'France', 48.8566, 2.3522)
ON CONFLICT DO NOTHING;

