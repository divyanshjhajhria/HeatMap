-- Update cities table for Manchester
DELETE FROM cities WHERE name = 'Paris';

INSERT INTO cities (name, country, lat, lng) 
VALUES ('Manchester', 'United Kingdom', 53.4808, -2.2426)
ON CONFLICT DO NOTHING;

-- Update places to be Manchester/University of Manchester specific
DELETE FROM places;

-- University of Manchester locations
INSERT INTO places (name, lat, lng, category, city_id) VALUES
  ('University of Manchester Main Campus', 53.4668, -2.2339, 'University', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Alan Gilbert Learning Commons', 53.4658, -2.2334, 'Library', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('John Rylands Library', 53.4794, -2.2447, 'Library', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Manchester Museum', 53.4658, -2.2339, 'Museum', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Whitworth Art Gallery', 53.4658, -2.2339, 'Gallery', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Students Union', 53.4668, -2.2339, 'Campus', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Sackville Street Building', 53.4758, -2.2407, 'University', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Stopford Building', 53.4658, -2.2339, 'University', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Owens Park', 53.4568, -2.2239, 'Accommodation', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Fallowfield Campus', 53.4468, -2.2139, 'Campus', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Manchester Central Library', 53.4794, -2.2447, 'Library', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Manchester Art Gallery', 53.4794, -2.2447, 'Gallery', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Northern Quarter', 53.4831, -2.2376, 'Neighborhood', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Gay Village', 53.4794, -2.2447, 'Neighborhood', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Spinningfields', 53.4794, -2.2447, 'Business District', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Piccadilly Gardens', 53.4814, -2.2376, 'Square', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Albert Square', 53.4794, -2.2447, 'Square', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Castlefield', 53.4758, -2.2507, 'Neighborhood', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Ancoats', 53.4831, -2.2307, 'Neighborhood', (SELECT id FROM cities WHERE name = 'Manchester')),
  ('Oxford Road', 53.4668, -2.2339, 'Street', (SELECT id FROM cities WHERE name = 'Manchester'));

