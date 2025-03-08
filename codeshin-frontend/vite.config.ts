import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/CodeShin/', // 这里非常重要
  plugins: [react()],
})
