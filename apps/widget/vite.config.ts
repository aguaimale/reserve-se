import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
   plugins: [vue()],
   define: {
      'process.env': {},
   },
   build: {
      lib: {
         entry: 'src/main.ts',
         name: 'BookingWidget',
         fileName: 'booking-widget',
         formats: ['umd'],
      },
      rollupOptions: {
         external: [],
         output: {
            globals: {
               vue: 'Vue',
            },
         },
      },
   },
});
