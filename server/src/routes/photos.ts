/**
 * Photos API routes - handle photo uploads and feed
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * POST /photos
 * Upload a photo (mock implementation - in production would handle S3 upload)
 * Body: { userId, placeId, s3Path }
 */
router.post('/photos', async (req: Request, res: Response) => {
  try {
    const { userId, placeId, s3Path } = req.body;
    
    if (!userId || !placeId || !s3Path) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, placeId, s3Path' 
      });
    }
    
    // Verify place exists
    const placeResult = await pool.query(
      'SELECT id FROM places WHERE id = $1',
      [placeId]
    );
    
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Create photo record
    const result = await pool.query(
      `INSERT INTO photos (user_id, place_id, timestamp, s3_path)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
       RETURNING *`,
      [userId, placeId, s3Path]
    );
    
    res.status(201).json({
      success: true,
      photo: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

