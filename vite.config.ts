import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT ?? 5173)

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: hmrClientPort
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})
