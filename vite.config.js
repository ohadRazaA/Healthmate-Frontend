import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // matches folder5's "@/..." import convention used throughout its ui/ components
      '@': path.resolve(__dirname, './src'),
    },
  },
})