/**
 * Authentication API routes
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /auth/signup
 * Register a new user (must be @student.manchester.ac.uk email)
 */
router.post('/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    
    // Validate email domain
    if (!email || !email.endsWith('@student.manchester.ac.uk')) {
      return res.status(400).json({ 
        error: 'Email must be a University of Manchester student email (@student.manchester.ac.uk)' 
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, username)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, username, created_at`,
      [email, passwordHash, firstName || null, lastName || null, username || null]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      user: result.rows[0],
      token,
    });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /auth/me
 * Get current user (requires authentication)
 */
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, username, profile_picture_url FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;

