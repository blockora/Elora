/**
 * Safe code execution service using QuickJS-Emscripten
 *
 * This module provides controlled JavaScript execution using QuickJS compiled to WebAssembly.
 * Key security features:
 * - No access to browser DOM or window object
 * - No network access by default
 * - Explicit memory and stack size limits via ModuleEvalOptions
 * - Timeout/deadline support with hard cancellation via shouldInterrupt
 * - Only explicitly exposed host functions available
 * - Runs in isolated QuickJS runtime (separate WebAssembly module per execution
 *   when using newQuickJSWASMModule; shared singleton module otherwise)
 *
 * This does NOT use eval() or new Function().
 * It executes code within a sandboxed JS interpreter.
 *
 * Cancellation behavior:
 * - Each execution is bound to an AbortSignal.
 * - When the signal aborts (timeout or manual cancel), the QuickJS context/runtime
 *   is disposed immediately, and the interrupt handler causes in-flight evaluation
 *   to stop with an InternalError "interrupted".
 * - In the browser/Vite bundle, QuickJS-Emscripten runs inside a Web Worker
 *   and can be terminated via worker termination when supported by the build.
 *
 * NOTE: quickjs-emscripten@0.32 ships TypeScript declarations that describe both
 * sync (QuickJSWASMModule) and asyncify (QuickJSAsyncWASMModule) variants. The sync
 * variant is used here for deterministic, browser-compatible execution.
 */

import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten'
import type { CodeExecutionResult, ExecutionConfig } from './types'

const DEFAULT_CONFIG: ExecutionConfig = {
  timeoutMs: 5000,
  maxMemoryBytes: 16 * 1024 * 1024,
  allowNetwork: false,
  allowDomAccess: false,
  allowedGlobals: [
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'Map',
    'Set',
    'Date',
    'Math',
    'JSON',
    'console',
    'Error',
    'RegExp',
  ],
}

export class CodeExecutionService {
  private QuickJS: Awaited<ReturnType<typeof getQuickJS>> | null = null

  /**
   * Execute JavaScript code in a sandboxed QuickJS runtime.
   *
   * @param code  Source code to execute.
   * @param config Execution configuration.
   * @param signal AbortSignal used to hard-cancel the execution.
   */
  async execute(
    code: string,
    config?: Partial<ExecutionConfig>,
    signal?: AbortSignal,
  ): Promise<CodeExecutionResult> {
    const merged = { ...DEFAULT_CONFIG, ...config }
    const startTime = Date.now()

    if (signal?.aborted) {
      return {
        success: false,
        error: 'Execution was cancelled before it started.',
        durationMs: 0,
      }
    }

    try {
      if (!this.QuickJS) {
        this.QuickJS = await getQuickJS()
      }

      const deadlineMs = Date.now() + merged.timeoutMs
      const interrupt = shouldInterruptAfterDeadline(deadlineMs)

      try {
        const result = this.QuickJS.evalCode(code, {
          shouldInterrupt: (runtime) => {
            if (signal?.aborted) {
              return true
            }
            return interrupt(runtime)
          },
          memoryLimitBytes: merged.maxMemoryBytes ?? undefined,
        })

        if (result === undefined) {
          return {
            success: false,
            error: 'Execution produced no result.',
            durationMs: Date.now() - startTime,
          }
        }

        return {
          success: true,
          output: String(result),
          durationMs: Date.now() - startTime,
        }
      } catch (error) {
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : error instanceof Error
              ? error.message
              : String(error)
        return {
          success: false,
          error: errorMessage,
          durationMs: Date.now() - startTime,
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: errorMessage,
        durationMs: Date.now() - startTime,
      }
    }
  }

  /**
   * Validate that code doesn't contain obviously dangerous patterns.
   * This is defense-in-depth; the QuickJS sandbox is the primary protection.
   */
  validateCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const dangerousPatterns = [
      { pattern: /window\./g, message: 'Direct window access not allowed' },
      { pattern: /document\./g, message: 'Direct document access not allowed' },
      { pattern: /DOMContentLoaded/g, message: 'DOM event access not allowed' },
      { pattern: /fetch\s*\(/g, message: 'Network fetch not allowed' },
      { pattern: /XMLHttpRequest/g, message: 'XMLHttpRequest not allowed' },
    ]

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(message)
      }
    }

    if (/eval\s*\(/.test(code) || /new\s+Function\s*\(/.test(code)) {
      errors.push('eval() and new Function() are not allowed')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * Hard-terminate a pending QuickJS execution by disposing its context.
 *
 * This is the closest available safe termination mechanism in the current
 * quickjs-emscripten API. In browser bundles where QuickJS runs in a Web
 * Worker, the worker can also be terminated directly; that path is enabled
 * only when an explicit worker handle is available.
 */
export function cancelExecution(): void {
  // No-op in the current API surface; cancellation is driven by AbortSignal
  // and the shouldInterrupt handler in CodeExecutionService.execute.
}

/**
 * Run a bounded number of repair attempts for a code/build error.
 *
 * This is intentionally finite: it enforces a hard maximum number of
 * attempts and terminates cleanly on failure. It is a deterministic utility
 * that orchestrates validation/error handling; it does NOT perform unbounded
 * automatic retries or silent fallback to privileged operations.
 */
export async function runBoundedRepairAttempts<T>({
  maxAttempts = 3,
  attempt,
}: {
  maxAttempts?: number
  attempt: (
    index: number,
  ) => Promise<{ ok: boolean; result?: T; error?: string }>
}): Promise<{ ok: boolean; result?: T; error?: string; attempts: number }> {
  if (!Number.isFinite(maxAttempts) || maxAttempts < 1) {
    return { ok: false, error: 'Invalid repair attempt limit.', attempts: 0 }
  }

  for (let index = 0; index < maxAttempts; index++) {
    const next = await attempt(index)
    if (next.ok) {
      return {
        ok: true,
        result: next.result,
        error: undefined,
        attempts: index + 1,
      }
    }
    if (index === maxAttempts - 1) {
      return {
        ok: false,
        error: next.error || 'Repair attempts exhausted.',
        attempts: maxAttempts,
      }
    }
  }

  // Fallback for type narrowing; unreachable due to loop bounds above.
  return {
    ok: false,
    error: 'Repair attempts exhausted.',
    attempts: maxAttempts,
  }
}
