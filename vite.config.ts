import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import detectPort from 'detect-port'
import { resolve } from 'path'

export default defineConfig(async () => {
  const basePort = 5173
  const port = await detectPort(basePort)
  if (port !== basePort) {
    console.log(`[dev] port ${basePort} in use, switched to ${port}`)
  }

  return {
    base: '/salary-system/',
    plugins: [
      vue(),
      {
        name: 'log-dev-port',
        configureServer(server) {
          server.httpServer?.once('listening', () => {
            const address = server.httpServer?.address()
            const actualPort =
              typeof address === 'object' && address && 'port' in address
                ? address.port
                : server.config.server.port
            console.log(`[dev] server listening on http://localhost:${actualPort}`)
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port
    }
  }
})
