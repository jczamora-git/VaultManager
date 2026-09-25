import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  publicDir: 'src/public',
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
