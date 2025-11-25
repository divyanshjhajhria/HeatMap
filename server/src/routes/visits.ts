/**
 * Visits API routes - handle user check-ins
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { isWithinDistance } from '../utils/h3Utils';

const router = Router();

/**
 * POST /visits
 * Create a new visit (check-in) when user is near a place
 * Body: { userId, placeId, userLat, userLng }
 */
router.post('/visits', async (req: Request, res: Response) => {
  try {
    const { userId, placeId, userLat, userLng } = req.body;
    
    if (!userId || !placeId || userLat === undefined || userLng === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, placeId, userLat, userLng' 
      });
    }
    
    // Get place coordinates
    const placeResult = await pool.query(
      'SELECT lat, lng FROM places WHERE id = $1',
      [placeId]
    );
    
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    const { lat: placeLat, lng: placeLng } = placeResult.rows[0];
    
    // Check if user is within 100 meters of the place
    const MAX_CHECKIN_DISTANCE = 100; // meters
    const isNearby = isWithinDistance(
      userLat,
      userLng,
      placeLat,
      placeLng,
      MAX_CHECKIN_DISTANCE
    );
    
    if (!isNearby) {
      return res.status(400).json({ 
        error: 'You must be within 100 meters of the place to check in',
        distance: calculateDistance(userLat, userLng, placeLat, placeLng),
      });
    }
    
    // Create visit record
    const result = await pool.query(
      `INSERT INTO visits (user_id, place_id, timestamp)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, placeId]
    );
    
    // Check for achievement unlocks (e.g., Hotspot Explorer)
    await checkAchievements(userId);
    
    res.status(201).json({
      success: true,
      visit: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check and unlock achievements for a user
 */
async function checkAchievements(userId: number): Promise<void> {
  try {
    // Check "Hotspot Explorer" achievement: visit 5 red (high popularity) areas
    // For now, we'll check if user has visited 5 different places
    const visitCount = await pool.query(
      'SELECT COUNT(DISTINCT place_id) as count FROM visits WHERE user_id = $1',
      [userId]
    );
    
    const distinctPlaces = parseInt(visitCount.rows[0].count);
    
    if (distinctPlaces >= 5) {
      // Get "Hotspot Explorer" achievement ID
      const achievementResult = await pool.query(
        "SELECT id FROM achievements WHERE name = 'Hotspot Explorer'"
      );
      
      if (achievementResult.rows.length > 0) {
        const achievementId = achievementResult.rows[0].id;
        
        // Check if already unlocked
        const existingResult = await pool.query(
          'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
          [userId, achievementId]
        );
        
        if (existingResult.rows.length === 0) {
          // Unlock achievement
          await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [userId, achievementId]
          );
          console.log(`Achievement unlocked: Hotspot Explorer for user ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
    // Don't throw - achievement checking shouldn't break the visit creation
  }
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export default router;

