/**
 * API Configuration
 * 
 * IMPORTANT: For Expo Go on physical devices, update LOCAL_IP with your computer's IP address
 * 
 * To find your IP address:
 * - macOS/Linux: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
 * - Windows: Run `ipconfig` and look for IPv4 Address
 * - Or check network settings in System Preferences/Settings
 */

import { Platform } from 'react-native';

// ⚠️ UPDATE THIS with your computer's local IP address
// This is the IP address your computer uses on your local network
// Example: '192.168.1.100' or '10.130.233.14'
export const LOCAL_IP = '10.130.233.14'; // Change this!

// Backend server port
export const API_PORT = 3000;

/**
 * Get the API base URL based on the environment
 */
export const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    // Production API URL
    return 'https://your-production-api.com/api';
  }

  // Development mode
  if (Platform.OS === 'web') {
    // Web browser - use localhost
    return `http://localhost:${API_PORT}/api`;
  }

  // For physical devices (iOS/Android), use the local IP address
  // This allows Expo Go to connect to your local backend server
  return `http://${LOCAL_IP}:${API_PORT}/api`;
};

