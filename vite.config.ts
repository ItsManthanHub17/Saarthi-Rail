import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // allows '@/components/...' etc.
    },
  },
  server: {
    port: 5173, // optional: set custom dev port
    open: true, // optional: auto-open in browser
  },
});
