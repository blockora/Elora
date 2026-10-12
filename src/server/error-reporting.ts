/**
 * Structured error reporting abstraction for Elora.
 *
 * Provides a consistent interface for recording operational events and
 * errors. By default, events are written to console (suitable for local
 * development and for hosts that capture stdout/stderr).
 *
 * To integrate a real error-reporting service (e.g. Sentry), replace the
 * exported singleton with an implementation that calls the service API.
 *
 * Design notes:
 * - The interface is generic: it accepts a category and a payload, so the
 *   same reporter can record generation events, API errors, auth events,
 *   and operational issues.
 * - No sensitive data is automatically included. Callers must explicitly
 *   add any context, which makes it harder to accidentally log secrets.
 * - The default implementation redacts values that look like API keys or
 *   tokens before writing to console.
 * - In production, the expectation is that the hosting platform captures
 *   stdout/stderr. For richer error reporting, swap in a real backend.
 */

export type ErrorCategory =
  | 'generation'
  | 'edit'
  | 'auth'
  | 'database'
  | 'export'
  | 'validation'
  | 'rate_limit'
  | 'operational'

export interface ErrorEvent {
  category: ErrorCategory
  /** Machine-readable error code, if any. */
  code?: string
  /** Human-readable message. Must not contain secrets. */
  message: string
  /** Optional structured context (must be sanitized by the caller). */
  context?: Record<string, unknown>
  /** How long the operation took, in milliseconds. */
  durationMs?: number
  /** Whether the operation ultimately succeeded. */
  success?: boolean
}

export type ErrorReporter = {
  report(event: ErrorEvent): void
  /** Record an unexpected exception. Sanitizes the error message. */
  reportError(
    category: ErrorCategory,
    error: unknown,
    context?: Record<string, unknown>,
  ): void
}

/**
 * Redact values that look like API keys, tokens, or passwords.
 */
export function redactSensitiveValues(value: unknown): unknown {
  if (typeof value !== 'string') return value
  // Hide strings that look like common secret formats
  if (
    /^(sk-|pk-|ghp_|gho_|ghu_|ghs_|ghr_|github_pat_|AIza|openai|supabase|Bearer\s)/i.test(
      value,
    ) ||
    (value.length > 0 && /[a-f0-9]{32}/i.test(value)) /*
                          lookahead for hex strings that may be keys */
  ) {
    return '[REDACTED]'
  }
  return value
}

export function redactContext(
  context: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!context) return undefined
  const redacted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    // Never include header-like or secret-like keys
    if (
      /authorization|token|key|secret|password|passwd|credential|header/i.test(
        key,
      )
    ) {
      redacted[key] = '[REDACTED]'
      continue
    }
    redacted[key] = redactSensitiveValues(value)
  }
  return redacted
}

/**
 * Default error reporter that writes to console.
 *
 * Suitable for local development and for hosting platforms that capture
 * stdout/stderr (e.g. Cloudflare Workers logs, Node processes with log
 * aggregation).
 */
export const consoleErrorReporter: ErrorReporter = {
  report(event) {
    const sanitized = {
      ...event,
      context: redactContext(event.context),
    }
    if (event.success === false || event.category === 'operational') {
      console.error('[elora/error]', JSON.stringify(sanitized))
    } else {
      console.log('[elora/event]', JSON.stringify(sanitized))
    }
  },

  reportError(category, error, context) {
    const message = error instanceof Error ? error.message : String(error)
    this.report({
      category,
      message: sanitizeErrorMessage(message),
      context: redactContext(context),
    })
  },
}

/**
 * Sanitize an error message for logging.
 *
 * Removes or replaces substrings that look like secrets.
 */
export function sanitizeErrorMessage(message: string): string {
  // Redact Bearer tokens
  let sanitized = message.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')

  // Redact "API key X", "secret X", "token X", "password=X" patterns
  sanitized = sanitized.replace(
    /(api[_ -]?key|secret|token|password)[\s=:]?\s*\S+/gi,
    (_, label) => {
      if (label) return label + ' [REDACTED]'
      return '[REDACTED]'
    },
  )

  // Redact known secret prefixes
  sanitized = sanitized.replace(
    /(sk-|pk-|ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]+/g,
    '[REDACTED]',
  )
  sanitized = sanitized.replace(/AIza[a-zA-Z0-9_-]+/g, '[REDACTED]')

  return sanitized
}

/**
 * Create a no-op reporter for tests or for environments where logging
 * should be suppressed.
 */
export const noopErrorReporter: ErrorReporter = {
  report() {},
  reportError() {},
}

// ---------------------------------------------------------------------------
// Singleton accessor
// ---------------------------------------------------------------------------

let currentReporter: ErrorReporter = consoleErrorReporter

export function setErrorReporter(reporter: ErrorReporter): void {
  currentReporter = reporter
}

export function getErrorReporter(): ErrorReporter {
  return currentReporter
}

/**
 * Convenience: report an error using the current reporter.
 */
export function reportError(
  category: ErrorCategory,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  getErrorReporter().reportError(category, error, context)
}

/**
 * Convenience: report an event using the current reporter.
 */
export function reportEvent(event: ErrorEvent): void {
  getErrorReporter().report(event)
}
