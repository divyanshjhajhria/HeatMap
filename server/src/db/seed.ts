/**
 * Seed file to populate database with Manchester/University of Manchester POIs
 */

import pool from './connection';

const manchesterPOIs = [
  { name: 'University of Manchester Main Campus', lat: 53.4668, lng: -2.2339, category: 'University' },
  { name: 'Alan Gilbert Learning Commons', lat: 53.4658, lng: -2.2334, category: 'Library' },
  { name: 'John Rylands Library', lat: 53.4794, lng: -2.2447, category: 'Library' },
  { name: 'Manchester Museum', lat: 53.4658, lng: -2.2339, category: 'Museum' },
  { name: 'Whitworth Art Gallery', lat: 53.4658, lng: -2.2339, category: 'Gallery' },
  { name: 'Students Union', lat: 53.4668, lng: -2.2339, category: 'Campus' },
  { name: 'Sackville Street Building', lat: 53.4758, lng: -2.2407, category: 'University' },
  { name: 'Stopford Building', lat: 53.4658, lng: -2.2339, category: 'University' },
  { name: 'Owens Park', lat: 53.4568, lng: -2.2239, category: 'Accommodation' },
  { name: 'Fallowfield Campus', lat: 53.4468, lng: -2.2139, category: 'Campus' },
  { name: 'Manchester Central Library', lat: 53.4794, lng: -2.2447, category: 'Library' },
  { name: 'Manchester Art Gallery', lat: 53.4794, lng: -2.2447, category: 'Gallery' },
  { name: 'Northern Quarter', lat: 53.4831, lng: -2.2376, category: 'Neighborhood' },
  { name: 'Gay Village', lat: 53.4794, lng: -2.2447, category: 'Neighborhood' },
  { name: 'Spinningfields', lat: 53.4794, lng: -2.2447, category: 'Business District' },
  { name: 'Piccadilly Gardens', lat: 53.4814, lng: -2.2376, category: 'Square' },
  { name: 'Albert Square', lat: 53.4794, lng: -2.2447, category: 'Square' },
  { name: 'Castlefield', lat: 53.4758, lng: -2.2507, category: 'Neighborhood' },
  { name: 'Ancoats', lat: 53.4831, lng: -2.2307, category: 'Neighborhood' },
  { name: 'Oxford Road', lat: 53.4668, lng: -2.2339, category: 'Street' },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get Manchester city ID
    const cityResult = await client.query(
      'SELECT id FROM cities WHERE name = $1',
      ['Manchester']
    );
    
    if (cityResult.rows.length === 0) {
      throw new Error('Manchester city not found. Please run migrations first.');
    }
    
    const cityId = cityResult.rows[0].id;
    
    // Insert places
    for (const poi of manchesterPOIs) {
      await client.query(
        `INSERT INTO places (name, lat, lng, category, city_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [poi.name, poi.lat, poi.lng, poi.category, cityId]
      );
    }
    
    await client.query('COMMIT');
    console.log(`✅ Seeded ${manchesterPOIs.length} Manchester POIs successfully!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;

