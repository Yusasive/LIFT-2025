// Base API URL from environment variable
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4000';
export const USER_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4001';
export const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4005';
export const BOOTH_BASE_URL = import.meta.env.VITE_BOOTH_SERVICE_URL || 'http://localhost:4006';
export const EMAIL_BASE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:4008';