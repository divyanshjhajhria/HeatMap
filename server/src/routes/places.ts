/**
 * Places API routes
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { Place } from '../types/models';

const router = Router();

/**
 * GET /places/:id
 * Get place details by ID
 */
router.get('/places/:id', async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.id);
    
    const result = await pool.query(
      `SELECT p.*, c.name as city_name 
       FROM places p
       JOIN cities c ON p.city_id = c.id
       WHERE p.id = $1`,
      [placeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    const place: Place = result.rows[0];
    res.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /places/:id/path
 * Get most-taken path from a location to the place (mock implementation)
 * Query params: fromLat, fromLng
 */
router.get('/places/:id/path', async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.id);
    const fromLat = parseFloat(req.query.fromLat as string);
    const fromLng = parseFloat(req.query.fromLng as string);
    
    if (!fromLat || !fromLng) {
      return res.status(400).json({ error: 'fromLat and fromLng query parameters are required' });
    }
    
    // Get place coordinates
    const placeResult = await pool.query(
      'SELECT lat, lng FROM places WHERE id = $1',
      [placeId]
    );
    
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    const { lat: toLat, lng: toLng } = placeResult.rows[0];
    
    // Generate mock polyline path (simple interpolation)
    // In production, this would use a routing service like Mapbox Directions API
    const path = generateMockPath(fromLat, fromLng, toLat, toLng);
    
    res.json({
      placeId,
      from: { lat: fromLat, lng: fromLng },
      to: { lat: toLat, lng: toLng },
      path,
      distance: calculateDistance(fromLat, fromLng, toLat, toLng),
    });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /places/:id/feed
 * Get location-gated feed for a place (mock implementation)
 */
router.get('/places/:id/feed', async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.id);
    
    // Verify place exists
    const placeResult = await pool.query(
      'SELECT id FROM places WHERE id = $1',
      [placeId]
    );
    
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Get photos for this place (mock data for now)
    const photosResult = await pool.query(
      `SELECT p.*, u.id as user_id 
       FROM photos p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.place_id = $1
       ORDER BY p.timestamp DESC
       LIMIT 20`,
      [placeId]
    );
    
    res.json({
      placeId,
      photos: photosResult.rows,
      count: photosResult.rows.length,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate mock path between two points
 */
function generateMockPath(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  numPoints: number = 10
): Array<{ lat: number; lng: number }> {
  const path = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Simple linear interpolation with slight curve
    const lat = fromLat + (toLat - fromLat) * t;
    const lng = fromLng + (toLng - fromLng) * t;
    
    // Add slight curve for more realistic path
    const curve = Math.sin(t * Math.PI) * 0.001;
    path.push({
      lat: lat + curve,
      lng: lng + curve,
    });
  }
  
  return path;
}

/**
 * Calculate distance between two points in meters (Haversine formula)
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

