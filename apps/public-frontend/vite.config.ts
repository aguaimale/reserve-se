import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [vue()],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },
   server: {
      port: 5174, // Puerto diferente al admin-frontend
      host: true,
   },
   build: {
      outDir: 'dist',
      sourcemap: true,
   },
   define: {
      // Definir variables de entorno por defecto
      'import.meta.env.VITE_API_BASE': JSON.stringify(
         process.env.VITE_API_BASE || 'http://localhost:3000/api/v1'
      ),
   },
});
