import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  base: '/',
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.js', '.ts', '.svelte']
  }
});
