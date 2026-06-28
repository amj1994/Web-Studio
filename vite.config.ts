import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // inline small assets (< 4KB) to reduce HTTP requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // split heavy vendor libs into separate chunks for better caching
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-gsap': ['gsap'],
          'vendor-lenis': ['lenis'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
