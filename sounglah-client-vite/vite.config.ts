import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    eslint(),
    svgrPlugin(), // Handles SVG imports as React components
  ],
  server: {
    port: 3000, 
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../sounglah-server/frontend_build', // This is the key change!
    // You might also want to clear the previous build directory
    emptyOutDir: true, // Vite typically does this by default, but explicit is good.
  },
});