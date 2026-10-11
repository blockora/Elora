import { describe, expect, it, vi } from 'vitest'
import {
  createApiHandler,
  generateResponseSchema,
  MockAIProvider,
  type AIProvider,
} from './api'

const post = (body: unknown) =>
  new Request('http://elora.test/api/generate', {
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
    const handler = createApiHandler(new MockAIProvider())
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
    const handler = createApiHandler(new MockAIProvider())
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
      (await createApiHandler(broken)(post({ prompt: 'A bakery' }))).status,
    ).toBe(502)
  })
})
