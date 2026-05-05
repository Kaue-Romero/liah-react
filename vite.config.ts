import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT ?? 5173)

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
