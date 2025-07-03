// Base API URL from environment variable
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4000';
export const USER_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4001';
