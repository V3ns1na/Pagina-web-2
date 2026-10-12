import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths allow the static build to work on GitHub Pages subpaths.
  base: './',
  plugins: [react()],
});
