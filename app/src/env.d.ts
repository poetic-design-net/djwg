/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '$env/static/public' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
