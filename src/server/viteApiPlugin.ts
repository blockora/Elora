import type { Plugin } from 'vite'
import { createApiHandler, MockAIProvider } from './api'

/** Exposes deterministic API routes to Vite development only; no production server is configured. */
export function apiDevPlugin(): Plugin {
  const handler = createApiHandler(new MockAIProvider())
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
