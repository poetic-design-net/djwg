/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
  readonly EDGE_FUNCTION_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '$env/static/private' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const SUPABASE_SERVICE_ROLE_KEY: string;
  export const SANITY_PROJECT_ID: string;
  export const SANITY_DATASET: string;
  export const SANITY_AUTH_TOKEN: string;
  export const EDGE_FUNCTION_API_KEY: string;
}
