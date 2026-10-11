import { z } from 'zod'
import { restaurantWebsite } from '../features/website/examples'
import { parseWebsiteSpec, type WebsiteSpec } from '../features/website/schema'

export const generateRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
})

export const generateResponseSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  provider: z.enum(['mock', 'configured']),
})

export interface AIProvider {
  generateWebsite(input: { prompt: string }): Promise<unknown>
}

/** Deterministic fixture provider for development and automated tests only. */
export class MockAIProvider implements AIProvider {
  async generateWebsite({ prompt }: { prompt: string }): Promise<unknown> {
    const title = prompt.trim().replace(/[.!?]+$/, '')
    return {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((section) =>
        section.type === 'hero' ? { ...section, title } : section,
      ),
    }
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

export function createApiHandler(provider?: AIProvider) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ status: 'ok' })
    }
    if (request.method !== 'POST' || url.pathname !== '/api/generate') {
      return json(
        { error: { code: 'NOT_FOUND', message: 'Route not found.' } },
        404,
      )
    }
    if (!provider) {
      return json(
        {
          error: {
            code: 'PROVIDER_NOT_CONFIGURED',
            message: 'Website generation is not configured.',
          },
        },
        503,
      )
    }

    let input: unknown
    try {
      input = await request.json()
    } catch {
      return json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON.',
          },
        },
        400,
      )
    }
    const parsed = generateRequestSchema.safeParse(input)
    if (!parsed.success) {
      return json(
        {
          error: {
            code: 'INVALID_PROMPT',
            message: 'Prompt must contain 1–500 characters.',
          },
        },
        400,
      )
    }

    try {
      const output = await provider.generateWebsite(parsed.data)
      const spec: WebsiteSpec = parseWebsiteSpec(output)
      return json({
        spec,
        provider: provider instanceof MockAIProvider ? 'mock' : 'configured',
      })
    } catch {
      return json(
        {
          error: {
            code: 'GENERATION_FAILED',
            message: 'The provider returned an invalid website specification.',
          },
        },
        502,
      )
    }
  }
}
