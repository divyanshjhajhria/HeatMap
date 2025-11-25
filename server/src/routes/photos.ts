/**
 * Photos API routes - handle photo uploads, time vault, and feed
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * POST /photos
 * Upload a photo with public/private settings
 * Body: { userId, placeId, s3Path, caption, tags, isPublic }
 */
router.post('/photos', async (req: Request, res: Response) => {
  try {
    const { userId, placeId, s3Path, caption, tags, isPublic } = req.body;
    
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
      `INSERT INTO photos (user_id, place_id, timestamp, s3_path, caption, tags, is_public)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6)
       RETURNING *`,
      [userId, placeId, s3Path, caption || null, tags || [], isPublic !== false]
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

/**
 * GET /photos/place/:placeId
 * Get all photos for a place (time vault)
 * Query: ?userId= - filter to show user's photos + public photos
 */
router.get('/photos/place/:placeId', async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.placeId);
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
    
    // Build query based on whether userId is provided
    let query;
    let params;
    
    if (userId) {
      // Show user's photos + public photos
      query = `
        SELECT p.*, u.id as user_id
        FROM photos p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.place_id = $1 AND (p.user_id = $2 OR p.is_public = true)
        ORDER BY p.timestamp DESC
      `;
      params = [placeId, userId];
    } else {
      // Show only public photos
      query = `
        SELECT p.*, u.id as user_id
        FROM photos p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.place_id = $1 AND p.is_public = true
        ORDER BY p.timestamp DESC
      `;
      params = [placeId];
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      placeId,
      photos: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /photos/user/:userId
 * Get all photos by a user
 */
router.get('/photos/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const result = await pool.query(
      `SELECT p.*, pl.name as place_name
       FROM photos p
       INNER JOIN places pl ON p.place_id = pl.id
       WHERE p.user_id = $1
       ORDER BY p.timestamp DESC`,
      [userId]
    );
    
    res.json({
      userId,
      photos: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching user photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /photos/:id
 * Update photo (caption, tags, privacy)
 */
router.put('/photos/:id', async (req: Request, res: Response) => {
  try {
    const photoId = parseInt(req.params.id);
    const { caption, tags, isPublic, userId } = req.body;
    
    // Verify ownership
    const photoResult = await pool.query(
      'SELECT user_id FROM photos WHERE id = $1',
      [photoId]
    );
    
    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    if (photoResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this photo' });
    }
    
    // Update photo
    const result = await pool.query(
      `UPDATE photos 
       SET caption = COALESCE($1, caption),
           tags = COALESCE($2, tags),
           is_public = COALESCE($3, is_public)
       WHERE id = $4
       RETURNING *`,
      [caption, tags, isPublic, photoId]
    );
    
    res.json({
      success: true,
      photo: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
