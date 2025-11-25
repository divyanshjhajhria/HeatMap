/**
 * TypeScript types for frontend
 */

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  PlaceDetails: { placeId: number };
  Achievements: { userId: number };
  TimeVault: { placeId: number };
  ChatRoom: { roomId: number; roomName?: string };
  NearbyChat: undefined;
  SocialFeed: undefined;
  ReelFeed: undefined;
  PhotoUpload: { placeId: number };
};

export interface HeatmapCell {
  h3Index: string;
  score: number;
  lat: number;
  lng: number;
  visitCount?: number; // Number of visits in this cell
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
  caption?: string;
  tags?: string[];
  is_public?: boolean;
  place_name?: string;
}

export interface ChatRoom {
  id: number;
  place_id?: number;
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
  radius_meters?: number;
  place_name?: string;
  active_users?: number;
  message_count?: number;
  created_at?: string;
}

export interface Message {
  id: number;
  chat_room_id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export interface PathPoint {
  lat: number;
  lng: number;
}

