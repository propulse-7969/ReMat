import { Capacitor } from '@capacitor/core';

export const getAPIBaseURL = () => {
  // Check if running as native mobile app
  if (Capacitor.isNativePlatform()) {
    // Use your computer's local IP for mobile development
    return 'http://172.20.37.138:8000'; // ← CHANGE THIS to your IP
  }
  
  // For web (browser)
  return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
};

export const API_BASE = getAPIBaseURL();