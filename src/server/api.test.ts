import { describe, expect, it, vi } from 'vitest'
import {
  createApiHandler,
  generateResponseSchema,
  MockAIProvider,
  MockAIEditProvider,
  type AIProvider,
} from './api'
import { restaurantWebsite } from '../features/website/examples'

const post = (body: unknown) =>
  new Request('http://elora.test/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

const editPost = (body: unknown) =>
  new Request('http://elora.test/api/edit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('API handler', () => {
  it('reports health without needing an AI provider', async () => {
    const response = await createApiHandler()(
      new Request('http://elora.test/api/health'),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('returns explicit unavailable response if generation has no provider', async () => {
    const response = await createApiHandler()(post({ prompt: 'A bakery' }))
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({
      error: { code: 'PROVIDER_NOT_CONFIGURED' },
    })
  })

  it('validates prompt and returns a schema-validated mock spec', async () => {
    const handler = createApiHandler({
      provider: new MockAIProvider(),
      editProvider: new MockAIEditProvider(),
    })
    expect((await handler(post({ prompt: '  ' }))).status).toBe(400)
    const response = await handler(post({ prompt: 'A small bakery!' }))
    expect(response.status).toBe(200)
    const payload: unknown = await response.json()
    expect(generateResponseSchema.safeParse(payload).success).toBe(true)
    expect(payload).toMatchObject({
      provider: 'mock',
      spec: {
        sections: expect.arrayContaining([
          expect.objectContaining({ type: 'hero', title: 'A small bakery' }),
        ]),
      },
    })
  })

  it('rejects malformed JSON, unknown routes, and invalid provider output', async () => {
    const handler = createApiHandler({
      provider: new MockAIProvider(),
      editProvider: new MockAIEditProvider(),
    })
    const malformed = new Request('http://elora.test/api/generate', {
      method: 'POST',
      body: '{',
    })
    expect((await handler(malformed)).status).toBe(400)
    expect((await handler(new Request('http://elora.test/nope'))).status).toBe(
      404,
    )
    const broken: AIProvider = {
      generateWebsite: vi.fn().mockResolvedValue({ untrusted: true }),
    }
    expect(
      (
        await createApiHandler({
          provider: broken,
          editProvider: new MockAIEditProvider(),
        })(post({ prompt: 'A bakery' }))
      ).status,
    ).toBe(502)
  })

  it('validates edit requests and returns updated spec', async () => {
    const handler = createApiHandler({
      provider: new MockAIProvider(),
      editProvider: new MockAIEditProvider(),
    })
    // Use a valid spec structure
    const spec = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((section) =>
        section.type === 'hero'
          ? { ...section, title: 'Original Title' }
          : section,
      ),
    }
    const response = await handler(
      editPost({
        currentSpec: spec,
        instruction: 'Make the hero title darker',
      }),
    )
    expect(response.status).toBe(200)
    const payload: unknown = await response.json()
    expect(payload).toMatchObject({
      provider: 'mock',
      changeSummary: expect.stringContaining('Make the hero title darker'),
    })
  })

  it('rejects edit requests without edit provider', async () => {
    const handler = createApiHandler({
      provider: new MockAIProvider(),
    })
    const response = await handler(
      editPost({
        currentSpec: {},
        instruction: 'Change something',
      }),
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({
      error: { code: 'EDIT_PROVIDER_NOT_CONFIGURED' },
    })
  })

  it('maps provider quota errors to QUOTA_EXCEEDED response', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const quotaProvider: AIProvider & { editWebsite?: never } = {
      generateWebsite: vi
        .fn()
        .mockRejectedValue(
          new Error('Free quota exceeded with upstream diagnostic details'),
        ),
    }
    const handler = createApiHandler({ provider: quotaProvider })
    try {
      const response = await handler(post({ prompt: 'A bakery' }))
      expect(response.status).toBe(503)
      const payload = await response.json()
      expect(payload).toMatchObject({
        error: { code: 'QUOTA_EXCEEDED' },
      })
      expect(payload.error.message).toContain('temporarily unavailable')
      expect(errorSpy).toHaveBeenCalledWith(
        'generation provider error (details withheld)',
      )
      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(
        'upstream diagnostic details',
      )
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('sanitizes upstream unavailability errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const unavailableProvider: AIProvider = {
      generateWebsite: vi
        .fn()
        .mockRejectedValue(
          new Error('Gemini API returned HTTP 503 with transient diagnostics'),
        ),
    }
    const handler = createApiHandler({ provider: unavailableProvider })
    try {
      const response = await handler(post({ prompt: 'A bakery' }))
      const payload = await response.json()
      expect(response.status).toBe(503)
      expect(payload).toMatchObject({
        error: { code: 'PROVIDER_UNAVAILABLE' },
      })
      expect(JSON.stringify(payload)).not.toContain('transient diagnostics')
      expect(errorSpy).toHaveBeenCalledWith(
        'generation provider error (details withheld)',
      )
    } finally {
      errorSpy.mockRestore()
    }
  })

  it('maps provider authentication errors to PROVIDER_AUTH_ERROR response', async () => {
    const authProvider: AIProvider & { editWebsite?: never } = {
      generateWebsite: vi
        .fn()
        .mockRejectedValue(new Error('API key not valid')),
    }
    const handler = createApiHandler({ provider: authProvider })
    const response = await handler(post({ prompt: 'A bakery' }))
    expect(response.status).toBe(502)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: { code: 'PROVIDER_AUTH_ERROR' },
    })
  })

  it('maps rate limit errors from provider to RATE_LIMIT_EXCEEDED response', async () => {
    const rateLimitProvider: AIProvider & { editWebsite?: never } = {
      generateWebsite: vi
        .fn()
        .mockRejectedValue(new Error('Rate limit exceeded, please slow down')),
    }
    const handler = createApiHandler({ provider: rateLimitProvider })
    const response = await handler(post({ prompt: 'A bakery' }))
    expect(response.status).toBe(429)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: { code: 'RATE_LIMIT_EXCEEDED' },
    })
  })

  it('returns GENERATION_TIMEOUT when provider exceeds timeout', async () => {
    const slowProvider: AIProvider & { editWebsite?: never } = {
      generateWebsite: vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new DOMException('The operation was aborted.', 'AbortError'),
              ),
            100,
          )
        })
      }),
    }
    const handler = createApiHandler({
      provider: slowProvider,
      timeoutMs: 50,
    })
    const response = await handler(post({ prompt: 'A bakery' }))
    expect(response.status).toBe(504)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: { code: 'GENERATION_TIMEOUT' },
    })
  })

  it('maps edit provider quota errors to QUOTA_EXCEEDED response', async () => {
    const quotaEditProvider = {
      editWebsite: vi
        .fn()
        .mockRejectedValue(new Error('Free quota exceeded for this project')),
    }
    const handler = createApiHandler({
      provider: new MockAIProvider(),
      editProvider: quotaEditProvider as never,
    })
    const response = await handler(
      editPost({
        currentSpec: {
          name: 'Test',
          description: 'Test',
          theme: restaurantWebsite.theme,
          sections: restaurantWebsite.sections,
        },
        instruction: 'Change something',
      }),
    )
    expect(response.status).toBe(503)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: { code: 'QUOTA_EXCEEDED' },
    })
  })

  it('handles malformed AI response in edit endpoint', async () => {
    const brokenEditProvider = {
      editWebsite: vi.fn().mockResolvedValue({ invalid: 'spec' }),
    }
    const handler = createApiHandler({
      provider: new MockAIProvider(),
      editProvider: brokenEditProvider as never,
    })
    const response = await handler(
      editPost({
        currentSpec: {
          name: 'Test',
          description: 'Test',
          theme: restaurantWebsite.theme,
          sections: restaurantWebsite.sections,
        },
        instruction: 'Change something',
      }),
    )
    expect(response.status).toBe(502)
    const payload = await response.json()
    expect(payload).toMatchObject({
      error: { code: 'EDIT_FAILED' },
    })
  })
})
