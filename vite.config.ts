import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * A custom Vite plugin to remove the Tailwind Play CDN script from index.html during production build.
 * This allows us to use the CDN for rapid development in AI Studio and a purged, optimized CSS file in production.
 */
const removeCdnInProduction = () => ({
  name: 'remove-tailwind-cdn-in-production',
  // This plugin only runs during the 'build' command, not 'serve'
  apply: 'build',
  transformIndexHtml(html) {
    // Simple string replacement to remove the script tag
    return html.replace(
      '<script src="https://cdn.tailwindcss.com"></script>',
      '' // Replace with an empty string
    );
  }
});


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        removeCdnInProduction(), // Add the custom plugin here
        VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
          },
          manifest: {
            name: 'Trợ lý tài chính cá nhân',
            short_name: 'FinBot',
            description: 'Một ứng dụng web sử dụng AI của Gemini để quản lý tài chính cá nhân.',
            theme_color: '#0f172a',
            background_color: '#0f172a',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});