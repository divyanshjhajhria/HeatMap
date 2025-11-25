/**
 * Achievements API routes
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /users/:id/achievements
 * Get all achievements for a user
 */
router.get('/users/:id/achievements', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    const result = await pool.query(
      `SELECT 
        a.id,
        a.name,
        a.description,
        a.icon_url,
        ua.unlocked_at,
        ua.created_at
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    );
    
    res.json({
      userId,
      achievements: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

