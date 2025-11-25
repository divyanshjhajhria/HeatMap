/**
 * Heatmap API routes
 */

import { Router, Request, Response } from 'express';
import { generateMockHeatmapCells } from '../utils/h3Utils';
import pool from '../db/connection';

const router = Router();

/**
 * GET /cities/:cityId/heatmap
 * Returns H3 cells with popularity scores for a city
 */
router.get('/cities/:cityId/heatmap', async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.cityId);
    
    // Get city coordinates from database
    const cityResult = await pool.query(
      'SELECT lat, lng FROM cities WHERE id = $1',
      [cityId]
    );
    
    if (cityResult.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const { lat, lng } = cityResult.rows[0];
    
    // Generate mock H3 heatmap cells
    const cells = generateMockHeatmapCells(lat, lng, 9);
    
    res.json({
      cityId,
      cells,
      count: cells.length,
    });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

