/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_MODE?: 'conductor' | 'driver' | 'cliente' | 'client' | 'comercio' | 'store' | 'admin';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
