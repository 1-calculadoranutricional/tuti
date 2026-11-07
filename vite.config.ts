import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    define: {
      __GAME__: JSON.stringify({
        id: "scrappy-yard",
        title: "Scrappy Yard",
        storagePrefix: "scrapyard",
        version: "0.1.0",
        preview: { models: [] },
        platform: { wavedash: { paidContent: false, p2p: false } },
      }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@game': path.resolve(__dirname, 'game/src/index.ts'),
        '@engine': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
