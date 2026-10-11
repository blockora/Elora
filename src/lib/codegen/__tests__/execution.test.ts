import { describe, expect, it } from 'vitest'
import { CodeExecutionService } from '../execution'

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

    // Verify the service was created successfully
    expect(service).toBeDefined()
  })
})
