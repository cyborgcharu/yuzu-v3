// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'googleapis',
        'google-auth-library',
        'events',
        'stream',
        'util',
        '@google-cloud/auth'
      ]
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'buffer': 'buffer/',
      'stream': 'stream-browserify',
      'util': 'util/'
    },
    conditions: ['node', 'module'],
    mainFields: ['module', 'main']
  },
  define: {
    'global': {},
    'process.env': {}
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'load-node-modules',
          setup(build) {
            build.onResolve({ filter: /^node:/ }, (args) => ({
              path: args.path.substring(5),
              external: true,
            }));
            build.onResolve({ filter: /^@google-cloud\/auth$/ }, (args) => ({
              path: args.path,
              external: true,
            }));
          },
        },
      ],
    },
  },
});