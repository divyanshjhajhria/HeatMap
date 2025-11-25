/**
 * API service for communicating with HeatGuide backend
 */

import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get heatmap data for a city
 */
export const getHeatmap = async (cityId: number) => {
  const response = await api.get(`/cities/${cityId}/heatmap`);
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
 * Upload a photo
 */
export const uploadPhoto = async (
  userId: number,
  placeId: number,
  s3Path: string
) => {
  const response = await api.post('/photos', {
    userId,
    placeId,
    s3Path,
  });
  return response.data;
};

export default api;

