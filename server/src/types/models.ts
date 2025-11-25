/**
 * TypeScript interfaces for all database models
 */

export interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  city_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Visit {
  id: number;
  user_id: number;
  place_id: number;
  timestamp: Date;
  created_at?: Date;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  created_at?: Date;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  unlocked_at: Date;
  created_at?: Date;
}

export interface Photo {
  id: number;
  user_id: number;
  place_id: number;
  timestamp: Date;
  s3_path: string;
  created_at?: Date;
}

export interface City {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  created_at?: Date;
}

/**
 * H3 cell with popularity score for heatmap
 */
export interface HeatmapCell {
  h3Index: string;
  score: number;
  lat: number;
  lng: number;
}

/**
 * Path point for route visualization
 */
export interface PathPoint {
  lat: number;
  lng: number;
}

