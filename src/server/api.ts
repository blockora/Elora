import { z } from 'zod'
import { restaurantWebsite } from '../features/website/examples'
import { parseWebsiteSpec, type WebsiteSpec } from '../features/website/schema'

// Request/Response schemas
export const generateRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
})

export const generateResponseSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  provider: z.enum(['mock', 'configured']),
})

export const editRequestSchema = z.object({
  currentSpec: z.record(z.string(), z.unknown()),
  instruction: z.string().trim().min(1).max(500),
})

export const editResponseSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  provider: z.enum(['mock', 'configured']),
  changeSummary: z.string().optional(),
})

// Provider interfaces
export interface AIProvider {
  generateWebsite(input: { prompt: string }): Promise<unknown>
}

export interface AIEditProvider {
  editWebsite(input: {
    currentSpec: unknown
    instruction: string
  }): Promise<unknown>
}

// Mock providers for development and testing
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

export class MockAIEditProvider implements AIEditProvider {
  async editWebsite({
    currentSpec,
    instruction,
  }: {
    currentSpec: unknown
    instruction: string
  }): Promise<unknown> {
    const spec = currentSpec as Record<string, unknown>
    if (spec.sections && Array.isArray(spec.sections)) {
      const updatedSections = spec.sections.map(
        (section: Record<string, unknown>) => {
          if (section.type === 'hero') {
            return {
              ...section,
              title:
                instruction.length > 20
                  ? instruction
                  : `Updated: ${instruction}`,
            }
          }
          return section
        },
      )
      return {
        ...spec,
        sections: updatedSections,
      }
    }
    return spec
  }
}

// Helper functions
const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })

// API Handler options
export interface ApiHandlerOptions {
  provider?: AIProvider
  editProvider?: AIEditProvider
  timeoutMs?: number
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
}

const defaultOptions: ApiHandlerOptions = {
  timeoutMs: 30000,
  rateLimit: undefined,
}

export function createApiHandler(options: ApiHandlerOptions = {}) {
  const {
    provider,
    editProvider,
    timeoutMs = 30000,
    rateLimit,
  } = { ...defaultOptions, ...options }

  // Simple in-memory rate limiter
  let requestTimestamps: number[] = []
  const checkRateLimit = (): { allowed: boolean; retryAfter?: number } => {
    if (!rateLimit) return { allowed: true }
    const now = Date.now()
    requestTimestamps = requestTimestamps.filter(
      (ts) => now - ts < rateLimit.windowMs,
    )
    if (requestTimestamps.length >= rateLimit.maxRequests) {
      const oldest = requestTimestamps[0]
      const retryAfter = Math.ceil((oldest + rateLimit.windowMs - now) / 1000)
      return { allowed: false, retryAfter: Math.max(1, retryAfter) }
    }
    requestTimestamps.push(now)
    return { allowed: true }
  }

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ status: 'ok' })
    }

    // Only POST /api/generate and POST /api/edit are supported
    if (
      request.method !== 'POST' ||
      (url.pathname !== '/api/generate' && url.pathname !== '/api/edit')
    ) {
      return json(
        { error: { code: 'NOT_FOUND', message: 'Route not found.' } },
        404,
      )
    }

    // Check rate limit
    if (rateLimit) {
      const rateLimitResult = checkRateLimit()
      if (!rateLimitResult.allowed) {
        return json(
          {
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              retryAfter: rateLimitResult.retryAfter,
            },
          },
          429,
          { 'retry-after': String(rateLimitResult.retryAfter) },
        )
      }
    }

    // Check provider availability
    if (url.pathname === '/api/generate' && !provider) {
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

    if (url.pathname === '/api/edit' && !editProvider) {
      return json(
        {
          error: {
            code: 'EDIT_PROVIDER_NOT_CONFIGURED',
            message: 'Website editing is not configured.',
          },
        },
        503,
      )
    }

    // Parse request body
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

    // Validate request based on endpoint
    if (url.pathname === '/api/generate') {
      const parsed = generateRequestSchema.safeParse(input)
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => i.message).join('; ')
        return json(
          {
            error: {
              code: 'INVALID_PROMPT',
              message: `Prompt must contain 1–500 characters. ${issues}`,
            },
          },
          400,
        )
      }

      // Execute generation with timeout
      return executeWithTimeout(
        () => provider!.generateWebsite(parsed.data),
        timeoutMs,
        'generation',
        (output) => {
          try {
            const spec: WebsiteSpec = parseWebsiteSpec(output)
            return json({
              spec,
              provider:
                provider instanceof MockAIProvider ? 'mock' : 'configured',
            })
          } catch {
            return json(
              {
                error: {
                  code: 'GENERATION_FAILED',
                  message:
                    'The provider returned an invalid website specification.',
                },
              },
              502,
            )
          }
        },
      )
    }

    // Edit endpoint
    if (url.pathname === '/api/edit') {
      const parsed = editRequestSchema.safeParse(input)
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => i.message).join('; ')
        return json(
          {
            error: {
              code: 'INVALID_EDIT_REQUEST',
              message: `Edit request is invalid. ${issues}`,
            },
          },
          400,
        )
      }

      // Execute edit with timeout
      return executeWithTimeout(
        () => editProvider!.editWebsite(parsed.data),
        timeoutMs,
        'edit',
        (output) => {
          try {
            const spec: WebsiteSpec = parseWebsiteSpec(output)
            return json({
              spec,
              provider:
                editProvider instanceof MockAIEditProvider
                  ? 'mock'
                  : 'configured',
              changeSummary: `Updated based on: "${parsed.data.instruction}"`,
            })
          } catch {
            return json(
              {
                error: {
                  code: 'EDIT_FAILED',
                  message:
                    'The provider returned an invalid website specification.',
                },
              },
              502,
            )
          }
        },
      )
    }

    // Should never reach here
    return json(
      { error: { code: 'NOT_FOUND', message: 'Route not found.' } },
      404,
    )
  }
}

// Helper to execute with timeout and error handling
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operationName: string,
  successHandler: (result: T) => Response,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const result = await fn()
    clearTimeout(timeoutId)
    return successHandler(result)
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return json(
        {
          error: {
            code: 'GENERATION_TIMEOUT',
            message: `The ${operationName} request timed out. Please try again.`,
          },
        },
        504,
      )
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return json(
        {
          error: {
            code: 'GENERATION_TIMEOUT',
            message: `The ${operationName} request timed out. Please try again.`,
          },
        },
        504,
      )
    }

    // Map known error patterns to user-friendly messages
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`${operationName} error:`, errorMessage)

    if (
      typeof errorMessage === 'string' &&
      /api[_ -]?key/i.test(errorMessage)
    ) {
      return json(
        {
          error: {
            code: 'PROVIDER_AUTH_ERROR',
            message: `Website ${operationName} is not configured properly. Please try again later.`,
          },
        },
        502,
      )
    }

    if (typeof errorMessage === 'string' && /quota/i.test(errorMessage)) {
      return json(
        {
          error: {
            code: 'QUOTA_EXCEEDED',
            message: `The ${operationName} service is temporarily unavailable. Please try again later.`,
          },
        },
        503,
      )
    }

    if (
      typeof errorMessage === 'string' &&
      /rate.*limit|429/i.test(errorMessage)
    ) {
      return json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait a moment and try again.',
          },
        },
        429,
      )
    }

    // Generic error
    return json(
      {
        error: {
          code: 'PROVIDER_ERROR',
          message: `The ${operationName} service encountered an error. Please try again later.`,
        },
      },
      502,
    )
  }
}
