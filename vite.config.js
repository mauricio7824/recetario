import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' permite alojarla en cualquier subruta (p. ej. GitHub Pages: usuario.github.io/recetario/)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg'],
      manifest: {
        name: 'Recetario',
        short_name: 'Recetario',
        description: 'Tus recetas, sin cuentas y sin conexión.',
        lang: 'es',
        theme_color: '#7A1F3D',
        background_color: '#F2F5F3',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'] }
    })
  ]
});
