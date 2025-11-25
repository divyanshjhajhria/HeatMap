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

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HeatGuide server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;

