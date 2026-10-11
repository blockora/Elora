import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiDevPlugin } from './src/server/viteApiPlugin'

export default defineConfig({ plugins: [react(), apiDevPlugin()] })
