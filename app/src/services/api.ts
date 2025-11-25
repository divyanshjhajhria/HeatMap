/**
 * API service for communicating with HeatGuide backend
 */

import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

// Log API URL in development for debugging
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  // Token will be added by individual requests that need it
  return config;
});

/**
 * Get heatmap data for a city
 * @param cityId - City ID
 * @param date - Optional date filter (YYYY-MM-DD) for specific day footfall
 * @param useMock - Optional flag to use mock data instead of real visits
 */
export const getHeatmap = async (
  cityId: number,
  date?: string,
  useMock: boolean = false
) => {
  const params: any = {};
  if (date) params.date = date;
  if (useMock) params.useMock = 'true';
  
  const response = await api.get(`/cities/${cityId}/heatmap`, { params });
  return response.data;
};

/**
 * Get all places for a city
 */
export const getCityPlaces = async (cityId: number) => {
  const response = await api.get(`/places/city/${cityId}`);
  return response.data;
};

/**
 * Get place details by ID
 */
export const getPlace = async (placeId: number) => {
  const response = await api.get(`/places/${placeId}`);
  return response.data;
};

/**
 * Get path from user location to place
 */
export const getPath = async (placeId: number, fromLat: number, fromLng: number) => {
  const response = await api.get(`/places/${placeId}/path`, {
    params: { fromLat, fromLng },
  });
  return response.data;
};

/**
 * Get feed for a place
 */
export const getPlaceFeed = async (placeId: number) => {
  const response = await api.get(`/places/${placeId}/feed`);
  return response.data;
};

/**
 * Check in at a place
 */
export const checkIn = async (
  userId: number,
  placeId: number,
  userLat: number,
  userLng: number
) => {
  const response = await api.post('/visits', {
    userId,
    placeId,
    userLat,
    userLng,
  });
  return response.data;
};

/**
 * Get user achievements
 */
export const getUserAchievements = async (userId: number) => {
  const response = await api.get(`/users/${userId}/achievements`);
  return response.data;
};

/**
 * Upload a photo with metadata
 */
export const uploadPhoto = async (
  userId: number,
  placeId: number,
  s3Path: string,
  caption?: string,
  tags?: string[],
  isPublic: boolean = true
) => {
  const response = await api.post('/photos', {
    userId,
    placeId,
    s3Path,
    caption,
    tags,
    isPublic,
  });
  return response.data;
};

/**
 * Get photos for a place (time vault)
 */
export const getPlacePhotos = async (placeId: number, userId?: number) => {
  const params = userId ? { userId } : {};
  const response = await api.get(`/photos/place/${placeId}`, { params });
  return response.data;
};

/**
 * Get user's photos
 */
export const getUserPhotos = async (userId: number) => {
  const response = await api.get(`/photos/user/${userId}`);
  return response.data;
};

/**
 * Update photo (caption, tags, privacy)
 */
export const updatePhoto = async (
  photoId: number,
  userId: number,
  caption?: string,
  tags?: string[],
  isPublic?: boolean
) => {
  const response = await api.put(`/photos/${photoId}`, {
    userId,
    caption,
    tags,
    isPublic,
  });
  return response.data;
};

// ===== CHAT API =====

/**
 * Find nearby chat rooms
 */
export const getNearbyChatRooms = async (lat: number, lng: number, radius?: number) => {
  const params: any = { lat, lng };
  if (radius) params.radius = radius;
  const response = await api.get('/chat/nearby', { params });
  return response.data;
};

/**
 * Get or create chat room for a place
 */
export const getPlaceChatRoom = async (placeId: number) => {
  const response = await api.get(`/chat/place/${placeId}`);
  return response.data;
};

/**
 * Get messages for a chat room
 */
export const getChatMessages = async (roomId: number, limit?: number, before?: string) => {
  const params: any = {};
  if (limit) params.limit = limit;
  if (before) params.before = before;
  const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
  return response.data;
};

/**
 * Send a message to a chat room
 */
export const sendMessage = async (roomId: number, userId: number, message: string) => {
  const response = await api.post(`/chat/rooms/${roomId}/messages`, {
    userId,
    message,
  });
  return response.data;
};

/**
 * Join a chat room
 */
export const joinChatRoom = async (roomId: number, userId: number) => {
  const response = await api.post(`/chat/rooms/${roomId}/join`, { userId });
  return response.data;
};

// ===== AUTH API =====

/**
 * Login user
 */
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Signup new user
 */
export const signup = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  username?: string
) => {
  const response = await api.post('/auth/signup', {
    email,
    password,
    firstName,
    lastName,
    username,
  });
  return response.data;
};

/**
 * Get current user
 */
export const getCurrentUser = async (token: string) => {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Set default auth token for authenticated requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;

