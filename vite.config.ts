import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/player/',
  plugins: [react()],
  // club-store is linked with file:, so make sure it shares this app's React.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5101, strictPort: true },
  // Netlify publishes `dist`, so the app must live under dist/player to match its base path.
  build: { outDir: 'dist/player' },
})
