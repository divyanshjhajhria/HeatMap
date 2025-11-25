/**
 * Proximity Chat API routes
 * Users can chat with others nearby or at the same place
 */

import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { isWithinDistance } from '../utils/h3Utils';

const router = Router();

/**
 * GET /chat/nearby
 * Find nearby chat rooms based on user location
 * Query: ?lat=&lng=&radius= (radius in meters, default 500)
 */
router.get('/chat/nearby', async (req: Request, res: Response) => {
  try {
    const userLat = parseFloat(req.query.lat as string);
    const userLng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 500;
    
    if (!userLat || !userLng) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }
    
    // Get all chat rooms (both place-based and location-based)
    const chatRoomsResult = await pool.query(
      `SELECT cr.*, 
              p.name as place_name,
              COUNT(DISTINCT ucr.user_id) as active_users,
              COUNT(DISTINCT m.id) as message_count
       FROM chat_rooms cr
       LEFT JOIN places p ON cr.place_id = p.id
       LEFT JOIN user_chat_rooms ucr ON cr.id = ucr.chat_room_id
       LEFT JOIN messages m ON cr.id = m.chat_room_id
       WHERE cr.lat IS NOT NULL AND cr.lng IS NOT NULL
       GROUP BY cr.id, p.name
       ORDER BY active_users DESC, message_count DESC`
    );
    
    // Filter by proximity
    const nearbyRooms = chatRoomsResult.rows.filter(room => {
      if (!room.lat || !room.lng) return false;
      const roomRadius = room.radius_meters || 500;
      return isWithinDistance(
        userLat,
        userLng,
        parseFloat(room.lat),
        parseFloat(room.lng),
        Math.max(radius, roomRadius)
      );
    });
    
    res.json({
      userLocation: { lat: userLat, lng: userLng },
      radius,
      chatRooms: nearbyRooms,
      count: nearbyRooms.length,
    });
  } catch (error) {
    console.error('Error finding nearby chat rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /chat/place/:placeId
 * Get or create chat room for a specific place
 */
router.get('/chat/place/:placeId', async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.placeId);
    
    // Check if chat room exists for this place
    let chatRoomResult = await pool.query(
      `SELECT cr.*, 
              p.name as place_name,
              COUNT(DISTINCT ucr.user_id) as active_users
       FROM chat_rooms cr
       INNER JOIN places p ON cr.place_id = p.id
       LEFT JOIN user_chat_rooms ucr ON cr.id = ucr.chat_room_id
       WHERE cr.place_id = $1
       GROUP BY cr.id, p.name
       LIMIT 1`,
      [placeId]
    );
    
    // Create chat room if it doesn't exist
    if (chatRoomResult.rows.length === 0) {
      const placeResult = await pool.query(
        'SELECT name, lat, lng FROM places WHERE id = $1',
        [placeId]
      );
      
      if (placeResult.rows.length === 0) {
        return res.status(404).json({ error: 'Place not found' });
      }
      
      const place = placeResult.rows[0];
      const createResult = await pool.query(
        `INSERT INTO chat_rooms (place_id, name, description, lat, lng, radius_meters)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          placeId,
          `${place.name} Chat`,
          `Chat with visitors at ${place.name}`,
          place.lat,
          place.lng,
          200, // 200m radius for place-based chats
        ]
      );
      
      chatRoomResult = { rows: [createResult.rows[0]] };
    }
    
    const chatRoom = chatRoomResult.rows[0];
    
    res.json({
      chatRoom,
      placeId,
    });
  } catch (error) {
    console.error('Error getting place chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /chat/rooms
 * Create a location-based chat room
 * Body: { name, lat, lng, radiusMeters, description }
 */
router.post('/chat/rooms', async (req: Request, res: Response) => {
  try {
    const { name, lat, lng, radiusMeters, description, placeId } = req.body;
    
    if (!name || !lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, lat, lng' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO chat_rooms (name, description, lat, lng, radius_meters, place_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, lat, lng, radiusMeters || 500, placeId || null]
    );
    
    res.status(201).json({
      success: true,
      chatRoom: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /chat/rooms/:roomId/messages
 * Get messages for a chat room
 * Query: ?limit= (default 50), ?before= (timestamp for pagination)
 */
router.get('/chat/rooms/:roomId/messages', async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;
    
    let query = `
      SELECT m.*, ucr.user_id
      FROM messages m
      LEFT JOIN user_chat_rooms ucr ON m.user_id = ucr.user_id
      WHERE m.chat_room_id = $1
    `;
    const params: any[] = [roomId];
    
    if (before) {
      query += ' AND m.created_at < $2';
      params.push(before);
    }
    
    query += ' ORDER BY m.created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    
    const result = await pool.query(query, params);
    
    res.json({
      roomId,
      messages: result.rows.reverse(), // Reverse to show oldest first
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /chat/rooms/:roomId/messages
 * Send a message to a chat room
 * Body: { userId, message }
 */
router.post('/chat/rooms/:roomId/messages', async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, message' 
      });
    }
    
    // Verify chat room exists
    const roomResult = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = $1',
      [roomId]
    );
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    // Add user to chat room if not already in it
    await pool.query(
      `INSERT INTO user_chat_rooms (user_id, chat_room_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, chat_room_id) DO NOTHING`,
      [userId, roomId]
    );
    
    // Create message
    const result = await pool.query(
      `INSERT INTO messages (chat_room_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [roomId, userId, message]
    );
    
    // Update chat room updated_at
    await pool.query(
      'UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [roomId]
    );
    
    res.status(201).json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /chat/rooms/:roomId/join
 * Join a chat room
 * Body: { userId }
 */
router.post('/chat/rooms/:roomId/join', async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }
    
    // Verify chat room exists
    const roomResult = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = $1',
      [roomId]
    );
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    // Join chat room
    const result = await pool.query(
      `INSERT INTO user_chat_rooms (user_id, chat_room_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, chat_room_id) DO UPDATE
       SET joined_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, roomId]
    );
    
    res.json({
      success: true,
      membership: result.rows[0],
    });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

