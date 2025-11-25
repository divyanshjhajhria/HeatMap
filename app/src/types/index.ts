/**
 * TypeScript types for frontend
 */

export type RootStackParamList = {
  Home: undefined;
  PlaceDetails: { placeId: number };
  Achievements: { userId: number };
};

export interface HeatmapCell {
  h3Index: string;
  score: number;
  lat: number;
  lng: number;
}

export interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  city_id: number;
  city_name?: string;
}

export interface Visit {
  id: number;
  user_id: number;
  place_id: number;
  timestamp: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  unlocked_at?: string;
}

export interface Photo {
  id: number;
  user_id: number;
  place_id: number;
  timestamp: string;
  s3_path: string;
}

export interface PathPoint {
  lat: number;
  lng: number;
}

