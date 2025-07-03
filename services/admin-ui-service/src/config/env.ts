interface EnvConfig {
  authServiceUrl: string;
  userServiceUrl: string;
  environment: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_AUTH_SERVICE_URL',
  'VITE_USER_SERVICE_URL',
  'VITE_ENVIRONMENT'
] as const;

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export const env: EnvConfig = {
  authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL,
  userServiceUrl: import.meta.env.VITE_USER_SERVICE_URL,
  environment: import.meta.env.VITE_ENVIRONMENT
};

// Type guard to check if we're in development
export const isDevelopment = env.environment === 'dev';

// Type guard to check if we're in production
export const isProduction = env.environment === 'prod'; 