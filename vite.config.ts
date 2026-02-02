import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 如果需要代理后端接口，取消下面注释并配置
    // proxy: {
    //   '/api': {
    //     target: 'http://your-backend-server:port',
    //     changeOrigin: true,
    //     // rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  }
})
