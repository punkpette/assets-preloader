// vite.config.js
import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',
      name: 'Preloader', // Global variable name for UMD format
      fileName: (format) => `preloader.${format}.js`,
      plugins: [
        nodePolyfills({
          include: null
        })
      ]
    },
    rollupOptions: {
      // Make sure to externalize dependencies if necessary
      external: ['events'],
      output: {
        globals: {
          events: 'EventEmitter' // Provide a name for the "events" module
        }
      }
    }
  }
});
