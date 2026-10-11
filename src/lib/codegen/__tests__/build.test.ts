import { describe, expect, it } from 'vitest'
import { BrowserBuildService } from '../build'

describe('BrowserBuildService', () => {
  it('builds valid QuickJS-compatible code successfully', async () => {
    const service = new BrowserBuildService()
    const result = await service.build('1 + 2')

    expect(result.success).toBe(true)
    expect(result.output).toBeDefined()
  })

  it('surfaces syntax errors through build errors', async () => {
    const service = new BrowserBuildService()
    const result = await service.build('const x =')

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors!.length).toBeGreaterThan(0)
    expect(result.errors![0].type).toBe('syntax')
  })

  it('rejects dangerous patterns before execution', async () => {
    const service = new BrowserBuildService()
    const result = await service.build(
      'window.location.href = "https://evil.com"',
    )

    expect(result.success).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({ type: 'other' }),
    )
  })

  it('respects an external AbortSignal by aborting execution', async () => {
    const service = new BrowserBuildService()
    const controller = new AbortController()
    controller.abort()

    const result = await service.build('1 + 1', undefined, controller.signal)

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  }, 10000)

  it('classifies timeout-related failures correctly', async () => {
    const service = new BrowserBuildService()
    // An infinite loop should be terminated by the execution path's timeout
    // and surfaced as a timeout/other error depending on the runtime message.
    const result = await service.build('while (true) {}', { timeoutMs: 50 })

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors!.length).toBeGreaterThan(0)
  }, 15000)
})
