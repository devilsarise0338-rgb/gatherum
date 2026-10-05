import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: the Tailwind Vite plugin was removed — src/index.css is hand-rolled
// and never imports "tailwindcss", so the plugin contributed nothing.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
