import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd() + '/app', '');
  
  return {
    plugins: [sveltekit()],
    base: '/',
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      extensions: ['.js', '.ts', '.svelte']
    },
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      }
    },
    define: {
      // Pass environment variables to the client
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(env.GOOGLE_CLIENT_SECRET),
      'process.env.AUTH_SECRET': JSON.stringify(env.AUTH_SECRET),
      'import.meta.env.SANITY_API_WRITE_TOKEN': JSON.stringify(env.SANITY_API_WRITE_TOKEN),
      'import.meta.env.SANITY_API_READ_TOKEN': JSON.stringify(env.SANITY_API_READ_TOKEN)
    }
  };
});
