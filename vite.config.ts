import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    // Avoid intermittent "504 Outdated Optimize Dep" when loading qrcode.react in dev
    include: ['qrcode.react'],
  },
});
