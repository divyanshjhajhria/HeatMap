/**
 * Seed file to generate sample visit data for testing heatmap
 * This creates realistic footfall data for Paris places
 */

import pool from './connection';

// Generate visits for the last 7 days with varying popularity
async function seedVisits() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all places in Manchester
    const cityResult = await client.query(
      "SELECT id FROM cities WHERE name = 'Manchester'"
    );
    
    if (cityResult.rows.length === 0) {
      throw new Error('Manchester city not found. Please run seed.ts first.');
    }
    
    const cityId = cityResult.rows[0].id;
    
    const placesResult = await client.query(
      'SELECT id, name FROM places WHERE city_id = $1 ORDER BY id',
      [cityId]
    );
    
    if (placesResult.rows.length === 0) {
      throw new Error('No places found. Please run seed.ts first.');
    }
    
    const places = placesResult.rows;
    
    // Popular places get more visits (simulating real footfall)
    const popularPlaces = [
      'University of Manchester Main Campus',
      'Alan Gilbert Learning Commons',
      'John Rylands Library',
      'Manchester Museum',
      'Students Union',
      'Northern Quarter',
      'Piccadilly Gardens',
    ];
    
    // Generate visits for the last 7 days
    const today = new Date();
    const visits = [];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const visitDate = new Date(today);
      visitDate.setDate(visitDate.getDate() - dayOffset);
      visitDate.setHours(0, 0, 0, 0);
      
      for (const place of places) {
        const isPopular = popularPlaces.includes(place.name);
        
        // Popular places get 20-50 visits per day
        // Regular places get 5-15 visits per day
        const minVisits = isPopular ? 20 : 5;
        const maxVisits = isPopular ? 50 : 15;
        const visitCount = Math.floor(Math.random() * (maxVisits - minVisits + 1)) + minVisits;
        
        // Distribute visits throughout the day (9 AM to 9 PM)
        for (let i = 0; i < visitCount; i++) {
          const visitTime = new Date(visitDate);
          const hour = 9 + Math.floor(Math.random() * 12); // 9 AM to 9 PM
          const minute = Math.floor(Math.random() * 60);
          visitTime.setHours(hour, minute, 0, 0);
          
          // Use different user IDs (1-10) to simulate multiple users
          const userId = Math.floor(Math.random() * 10) + 1;
          
          visits.push({
            user_id: userId,
            place_id: place.id,
            timestamp: visitTime,
          });
        }
      }
    }
    
    // Insert visits in batches
    let inserted = 0;
    for (const visit of visits) {
      await client.query(
        `INSERT INTO visits (user_id, place_id, timestamp)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [visit.user_id, visit.place_id, visit.timestamp]
      );
      inserted++;
    }
    
    await client.query('COMMIT');
    console.log(`✅ Seeded ${inserted} visits across ${places.length} places over 7 days`);
    console.log(`📊 Popular places have more visits (20-50/day), others have 5-15/day`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding visits:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedVisits()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedVisits;

