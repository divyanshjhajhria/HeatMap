/**
 * Seed file to populate database with Paris POIs (Points of Interest)
 */

import pool from './connection';

const parisPOIs = [
  { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, category: 'Landmark' },
  { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, category: 'Museum' },
  { name: 'Notre-Dame Cathedral', lat: 48.8530, lng: 2.3499, category: 'Religious' },
  { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950, category: 'Landmark' },
  { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3081, category: 'Shopping' },
  { name: 'Montmartre', lat: 48.8867, lng: 2.3431, category: 'Neighborhood' },
  { name: 'Sacré-Cœur', lat: 48.8867, lng: 2.3431, category: 'Religious' },
  { name: 'Seine River', lat: 48.8566, lng: 2.3522, category: 'Natural' },
  { name: 'Musée d\'Orsay', lat: 48.8600, lng: 2.3266, category: 'Museum' },
  { name: 'Palace of Versailles', lat: 48.8049, lng: 2.1204, category: 'Palace' },
  { name: 'Latin Quarter', lat: 48.8506, lng: 2.3447, category: 'Neighborhood' },
  { name: 'Marais District', lat: 48.8566, lng: 2.3622, category: 'Neighborhood' },
  { name: 'Père Lachaise Cemetery', lat: 48.8614, lng: 2.3933, category: 'Cemetery' },
  { name: 'Sainte-Chapelle', lat: 48.8554, lng: 2.3450, category: 'Religious' },
  { name: 'Place de la Bastille', lat: 48.8532, lng: 2.3694, category: 'Square' },
  { name: 'Jardin du Luxembourg', lat: 48.8462, lng: 2.3372, category: 'Park' },
  { name: 'Tuileries Garden', lat: 48.8636, lng: 2.3274, category: 'Park' },
  { name: 'Panthéon', lat: 48.8462, lng: 2.3462, category: 'Monument' },
  { name: 'Place Vendôme', lat: 48.8686, lng: 2.3294, category: 'Square' },
  { name: 'Opéra Garnier', lat: 48.8719, lng: 2.3316, category: 'Theater' },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get Paris city ID
    const cityResult = await client.query(
      'SELECT id FROM cities WHERE name = $1',
      ['Paris']
    );
    
    if (cityResult.rows.length === 0) {
      throw new Error('Paris city not found. Please run migrations first.');
    }
    
    const cityId = cityResult.rows[0].id;
    
    // Insert places
    for (const poi of parisPOIs) {
      await client.query(
        `INSERT INTO places (name, lat, lng, category, city_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [poi.name, poi.lat, poi.lng, poi.category, cityId]
      );
    }
    
    await client.query('COMMIT');
    console.log(`✅ Seeded ${parisPOIs.length} Paris POIs successfully!`);
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

