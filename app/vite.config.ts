import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { sentrySvelteKit } from '@sentry/sveltekit'
import { fileURLToPath } from 'url';
import path from 'path';


export default defineConfig(({ mode }) => {
  // Get the root directory (one level up from app directory)
  const rootDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  
  // Load env file from root directory
  const env = loadEnv(mode, rootDir, '');
  
  console.log('Loading environment from:', rootDir);
  console.log('Mode:', mode);
  
  return {
    plugins: [ sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'poetic-design-llp',
        project: 'javascript-sveltekit',
      }
    }),sveltekit()],
    base: '/',
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      extensions: ['.js', '.ts', '.svelte']
    },
    server: {
      host: true, // Listen on all addresses, including LAN and localhost
      port: 5173, // Default Vite port
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      },
      hmr: {
        // Verbesserte HMR-Konfiguration
        timeout: 5000,
        overlay: true,
        clientPort: 5173
      }
    },
    optimizeDeps: {
      exclude: ['@ethereum-mainnet/contracts'] // Excludiere Web3-bezogene Module von der Optimierung
    },
    define: {
      // Pass environment variables to the client
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(env.GOOGLE_CLIENT_SECRET),
      'process.env.AUTH_SECRET': JSON.stringify(env.AUTH_SECRET),
      'import.meta.env.SANITY_API_WRITE_TOKEN': JSON.stringify(env.SANITY_API_WRITE_TOKEN),
      'import.meta.env.SANITY_API_READ_TOKEN': JSON.stringify(env.SANITY_API_READ_TOKEN),
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(env.PUBLIC_SUPABASE_URL),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY)
    }
  };
});
