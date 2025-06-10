import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '_redirects',  // ✅ copy from root
          dest: '.'           // ✅ to dist/
        }
      ]
    })
  ],
  optimizeDeps: {
    include: ['react-toastify']
  }
});
