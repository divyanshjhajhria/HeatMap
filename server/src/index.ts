/**
 * HeatGuide Server - Main entry point
 * Express server with TypeScript for HeatGuide backend
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import heatmapRoutes from './routes/heatmap';
import placesRoutes from './routes/places';
import visitsRoutes from './routes/visits';
import achievementsRoutes from './routes/achievements';
import photosRoutes from './routes/photos';
import chatRoutes from './routes/chat';
import authRoutes from './routes/auth';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', heatmapRoutes);
app.use('/api', placesRoutes);
app.use('/api', visitsRoutes);
app.use('/api', achievementsRoutes);
app.use('/api', photosRoutes);
app.use('/api', chatRoutes);
app.use('/api', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
// Listen on all network interfaces (0.0.0.0) to allow connections from mobile devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HeatGuide server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Server accessible from network devices`);
  console.log(`📱 Update LOCAL_IP in app/src/config/api.ts with your computer's IP address`);
});

export default app;

