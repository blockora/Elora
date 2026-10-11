import type { Plugin } from 'vite'
import {
  createApiHandler,
  MockAIProvider,
  MockAIEditProvider,
  type AIProvider,
  type AIEditProvider,
} from './api'
import { loadServerConfig, createServerProvider } from './config'

/** Exposes API routes to Vite development only; no production server is configured. */
export function apiDevPlugin(): Plugin {
  let handler = createApiHandler({
    provider: new MockAIProvider(),
    editProvider: new MockAIEditProvider(),
    timeoutMs: 10000,
    rateLimit: {
      maxRequests: 30,
      windowMs: 60000,
    },
  })

  // Attempt to load server config for more realistic development
  try {
    const config = loadServerConfig()
    if (config.providerType !== 'mock') {
      const provider = createServerProvider(config)
      // For Gemini, we use the same provider for both generation and editing
      handler = createApiHandler({
        provider: provider as AIProvider,
        editProvider: provider as unknown as AIEditProvider,
        timeoutMs: config.timeoutMs,
        rateLimit: config.rateLimit,
      })
    }
  } catch (error) {
    console.warn('API configuration warning:', error)
  }

  return {
    name: 'elora-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const chunks: Buffer[] = []
        try {
          for await (const chunk of req) chunks.push(Buffer.from(chunk))
          const payload = Buffer.concat(chunks)
          if (payload.byteLength > 16_384) {
            res.statusCode = 413
            res.setHeader('content-type', 'application/json; charset=utf-8')
            res.end(
              JSON.stringify({
                error: {
                  code: 'BODY_TOO_LARGE',
                  message: 'Request body is too large.',
                },
              }),
            )
            return
          }
          const request = new Request(new URL(req.url, 'http://localhost'), {
            method: req.method,
            headers: req.headers as HeadersInit,
            body:
              req.method === 'GET' || req.method === 'HEAD'
                ? undefined
                : payload,
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (error) {
          next(error)
        }
      })
    },
  }
}
