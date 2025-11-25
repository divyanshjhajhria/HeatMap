/**
 * Heatmap API routes
 */

import { Router, Request, Response } from 'express';
import { generateHeatmapFromVisits, generateMockHeatmapCells } from '../utils/h3Utils';
import pool from '../db/connection';

const router = Router();

/**
 * GET /cities/:cityId/heatmap
 * Returns H3 cells with popularity scores for a city based on actual visit data
 * 
 * Query parameters:
 * - date: Optional date filter (YYYY-MM-DD) to show footfall for a specific day
 * - useMock: Optional flag to use mock data instead of real visits (default: false)
 */
router.get('/cities/:cityId/heatmap', async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.cityId);
    const dateFilter = req.query.date as string | undefined;
    const useMock = req.query.useMock === 'true';
    
    // Get city coordinates from database
    const cityResult = await pool.query(
      'SELECT lat, lng FROM cities WHERE id = $1',
      [cityId]
    );
    
    if (cityResult.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const { lat, lng } = cityResult.rows[0];
    
    let cells;
    
    if (useMock) {
      // Use mock data (for testing or when no visit data exists)
      cells = generateMockHeatmapCells(lat, lng, 9);
    } else {
      // Get actual visit data from places in this city
      // Aggregate all visits per place, optionally filtered by date
      const visitsQuery = dateFilter
        ? `
          SELECT 
            p.lat,
            p.lng,
            v.timestamp,
            COUNT(*) as visit_count
          FROM visits v
          INNER JOIN places p ON v.place_id = p.id
          WHERE p.city_id = $1 AND DATE(v.timestamp) = $2
          GROUP BY p.lat, p.lng, v.timestamp
          ORDER BY visit_count DESC
        `
        : `
          SELECT 
            p.lat,
            p.lng,
            v.timestamp,
            COUNT(*) as visit_count
          FROM visits v
          INNER JOIN places p ON v.place_id = p.id
          WHERE p.city_id = $1
          GROUP BY p.lat, p.lng, v.timestamp
          ORDER BY visit_count DESC
        `;
      
      const visitsResult = dateFilter
        ? await pool.query(visitsQuery, [cityId, dateFilter])
        : await pool.query(visitsQuery, [cityId]);
      
      // Transform visit data for heatmap generation
      // Each visit becomes a data point, spread slightly around the place location
      const visitData: Array<{ lat: number; lng: number; timestamp?: Date }> = [];
      
      for (const row of visitsResult.rows) {
        const visitCount = parseInt(row.visit_count);
        const baseLat = parseFloat(row.lat);
        const baseLng = parseFloat(row.lng);
        const timestamp = row.timestamp ? new Date(row.timestamp) : undefined;
        
        // Create data points for each visit, with slight spread to create heat zones
        for (let i = 0; i < visitCount; i++) {
          // Add slight random offset to spread heat around the place (~50-100m spread)
          const offsetLat = (Math.random() - 0.5) * 0.001;
          const offsetLng = (Math.random() - 0.5) * 0.001;
          
          visitData.push({
            lat: baseLat + offsetLat,
            lng: baseLng + offsetLng,
            timestamp,
          });
        }
      }
      
      // If no visits, get all places to show potential hotspots
      if (visitData.length === 0) {
        const placesResult = await pool.query(
          'SELECT lat, lng FROM places WHERE city_id = $1',
          [cityId]
        );
        
        // Add places as potential hotspots with low scores
        placesResult.rows.forEach(place => {
          visitData.push({
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lng),
            timestamp: undefined,
          });
        });
      }
      
      // Generate heatmap from real visit data
      cells = generateHeatmapFromVisits(visitData, lat, lng, 9, dateFilter);
    }
    
    res.json({
      cityId,
      cells,
      count: cells.length,
      dateFilter: dateFilter || null,
      dataSource: useMock ? 'mock' : 'real',
      totalVisits: useMock ? null : cells.reduce((sum, cell) => sum + (cell.visitCount || 0), 0),
    });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

