import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest'
import {
  consoleErrorReporter,
  noopErrorReporter,
  setErrorReporter,
  getErrorReporter,
  reportError,
  reportEvent,
  type ErrorEvent,
  redactSensitiveValues,
  sanitizeErrorMessage,
} from './error-reporting'

describe('error-reporting: redaction utilities', () => {
  it('redacts strings that look like API keys', () => {
    expect(redactSensitiveValues('sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ123456')).toBe(
      '[REDACTED]',
    )
    expect(redactSensitiveValues('ghp_1234567890abcdefghijklmnopqrstuv')).toBe(
      '[REDACTED]',
    )
    expect(redactSensitiveValues('AIzaSyDummyGoogleApiKey123456789')).toBe(
      '[REDACTED]',
    )
  })

  it('does not redact normal strings', () => {
    expect(redactSensitiveValues('A small bakery website')).toBe(
      'A small bakery website',
    )
    expect(redactSensitiveValues('hero')).toBe('hero')
    expect(redactSensitiveValues('https://example.com')).toBe(
      'https://example.com',
    )
  })

  it('sanitizes error messages containing secrets', () => {
    expect(sanitizeErrorMessage('API key not valid')).toContain('[REDACTED]')
    expect(sanitizeErrorMessage('Bearer eyJhbGciOiJIUzI1NiJ9.token')).toContain(
      '[REDACTED]',
    )
    expect(sanitizeErrorMessage('Invalid API key: sk-abc123')).toContain(
      '[REDACTED]',
    )
  })

  it('preserves non-secret error messages', () => {
    expect(sanitizeErrorMessage('Rate limit exceeded')).toBe(
      'Rate limit exceeded',
    )
    expect(sanitizeErrorMessage('The operation timed out')).toBe(
      'The operation timed out',
    )
  })
})

describe('error-reporting: console reporter', () => {
  it('is the default reporter', () => {
    expect(getErrorReporter()).toBe(consoleErrorReporter)
  })

  it('can be replaced with a custom reporter', () => {
    const custom = { report: vi.fn(), reportError: vi.fn() }
    setErrorReporter(custom)
    expect(getErrorReporter()).toBe(custom)
    setErrorReporter(consoleErrorReporter) // restore
  })

  it('redacts sensitive context before logging', () => {
    // Test that consoleErrorReporter redacts sensitive values.
    // We capture console.log output and verify the redacted JSON.
    let loggedJson: string | null = null
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      // Capture the first string argument (the JSON)
      for (const arg of args) {
        if (typeof arg === 'string') {
          loggedJson = arg
        }
      }
    }

    reportEvent({
      category: 'generation',
      message: 'test',
      context: {
        prompt: 'A bakery',
        apiKey: 'sk-secret123',
        header: 'Bearer token123',
      },
    })

    console.log = originalLog

    // The console reporter should have logged a redacted JSON string
    expect(loggedJson).not.toBeNull()
    const logged = JSON.parse(loggedJson!)
    expect(logged.context?.apiKey).toBe('[REDACTED]')
    expect(logged.context?.header).toBe('[REDACTED]')
    expect(logged.context?.prompt).toBe('A bakery')
  })
})

describe('error-reporting: noop reporter', () => {
  beforeEach(() => {
    setErrorReporter(noopErrorReporter)
  })

  afterAll(() => {
    setErrorReporter(consoleErrorReporter)
  })

  it('does not throw when reporting errors', () => {
    expect(() => {
      reportError('generation', new Error('test error'))
      reportError('generation', 'string error')
      reportError('generation', null as unknown as Error)
    }).not.toThrow()
  })

  it('does not throw when reporting events', () => {
    expect(() => {
      reportEvent({
        category: 'generation',
        message: 'test',
        success: true,
      })
    }).not.toThrow()
  })
})

describe('error-reporting: integration with API handler', () => {
  it('is available for import by the API handler', async () => {
    // Verify the module exports are usable
    const reporter = getErrorReporter()
    expect(typeof reporter.report).toBe('function')
    expect(typeof reporter.reportError).toBe('function')

    // Report a sample error
    setErrorReporter(noopErrorReporter)
    reportError('generation', new Error('test'))
    setErrorReporter(consoleErrorReporter)
  })

  it('can be used to record generation events', () => {
    const events: ErrorEvent[] = []
    const custom = {
      report: (event: ErrorEvent) => events.push(event),
      reportError: vi.fn(),
    }
    setErrorReporter(custom)

    reportEvent({
      category: 'generation',
      message: 'generation completed',
      durationMs: 1200,
      success: true,
    })

    setErrorReporter(consoleErrorReporter)
    expect(events.length).toBe(1)
    expect(events[0].category).toBe('generation')
    expect(events[0].success).toBe(true)
    expect(events[0].durationMs).toBe(1200)
  })
})
