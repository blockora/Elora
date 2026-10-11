import { describe, expect, it, vi } from 'vitest'
import { CodeExecutionService, runBoundedRepairAttempts } from '../execution'

describe('CodeExecutionService', () => {
  it('validates code for dangerous patterns', () => {
    const service = new CodeExecutionService()

    const validCode = 'const x = 1 + 2'
    const invalidCode = 'window.location.href = "https://evil.com"'

    expect(service.validateCode(validCode).valid).toBe(true)
    expect(service.validateCode(invalidCode).valid).toBe(false)
    expect(service.validateCode(invalidCode).errors).toContain(
      'Direct window access not allowed',
    )
  })

  it('rejects code with eval attempts', () => {
    const service = new CodeExecutionService()

    const codeWithEval = 'eval("alert(1)")'

    const validation = service.validateCode(codeWithEval)
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain(
      'eval() and new Function() are not allowed',
    )
  })

  it('rejects code with fetch attempts', () => {
    const service = new CodeExecutionService()

    const codeWithFetch = 'fetch("https://evil.com")'

    const validation = service.validateCode(codeWithFetch)
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('Network fetch not allowed')
  })

  it('rejects code with document access', () => {
    const service = new CodeExecutionService()

    const codeWithDoc = 'document.cookie'

    const validation = service.validateCode(codeWithDoc)
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('Direct document access not allowed')
  })

  it('validates complex but safe code', () => {
    const service = new CodeExecutionService()

    const safeCode = `
      const arr = [1, 2, 3];
      const sum = arr.reduce((a, b) => a + b, 0);
      sum;
    `

    expect(service.validateCode(safeCode).valid).toBe(true)
  })

  it('has proper execution config defaults', () => {
    const service = new CodeExecutionService()

    expect(service).toBeDefined()
  })

  it('returns an error when execution is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const service = new CodeExecutionService()

    const result = await service.execute('1 + 1', undefined, controller.signal)
    expect(result.success).toBe(false)
    expect(result.error).toContain('cancelled')
  })

  it('times out and aborts long-running code', async () => {
    const service = new CodeExecutionService()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 50)

    const result = await service.execute(
      'while (true) {}',
      { timeoutMs: 50 },
      controller.signal,
    )

    clearTimeout(timeout)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  }, 15000)
})

describe('runBoundedRepairAttempts', () => {
  it('returns immediately on the first successful attempt', async () => {
    const result = await runBoundedRepairAttempts({
      maxAttempts: 3,
      attempt: vi.fn().mockResolvedValue({ ok: true, result: 'fixed' }),
    })

    expect(result.ok).toBe(true)
    expect(result.result).toBe('fixed')
    expect(result.attempts).toBe(1)
    expect(result.error).toBeUndefined()
  })

  it('retries on transient failures and succeeds within the limit', async () => {
    let callCount = 0
    const result = await runBoundedRepairAttempts({
      maxAttempts: 3,
      attempt: async () => {
        callCount++
        if (callCount < 3) {
          return { ok: false, error: 'transient' }
        }
        return { ok: true, result: 'fixed' }
      },
    })

    expect(result.ok).toBe(true)
    expect(result.attempts).toBe(3)
    expect(result.result).toBe('fixed')
  })

  it('stops after the maximum number of attempts and reports the final error', async () => {
    const result = await runBoundedRepairAttempts({
      maxAttempts: 2,
      attempt: async () => ({ ok: false, error: 'build failed' }),
    })

    expect(result.ok).toBe(false)
    expect(result.attempts).toBe(2)
    // When every attempt returns a concrete error, that error is preserved
    // rather than replaced with a generic message.
    expect(result.error).toBe('build failed')
  })

  it('rejects invalid attempt limits and terminates cleanly', async () => {
    const result = await runBoundedRepairAttempts({
      maxAttempts: 0,
      attempt: async () => ({ ok: true, result: 'should not run' }),
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('Invalid repair attempt limit.')
    expect(result.attempts).toBe(0)
  })

  it('captures a concrete error when all attempts fail', async () => {
    const result = await runBoundedRepairAttempts({
      maxAttempts: 2,
      attempt: async () => ({ ok: false, error: 'syntax error on line 1' }),
    })

    expect(result.ok).toBe(false)
    expect(result.error).toBe('syntax error on line 1')
    expect(result.attempts).toBe(2)
  })
})
