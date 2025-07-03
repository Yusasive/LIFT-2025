/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVICE_BASE_URL: string
  readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 