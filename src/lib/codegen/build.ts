/**
 * Build and execution orchestration for the browser/Vite environment.
 *
 * This module provides a thin orchestration layer over the QuickJS execution
 * service with deterministic browser-compatible behavior, error classification,
 * and cancellation. It is intended to be exercised by browser/Vite tests as
 * well as Node tests.
 */

import { CodeExecutionService } from './execution'
import type {
  BuildError,
  BuildResult,
  CodeExecutionResult,
  ExecutionConfig,
} from './types'

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

export class BrowserBuildService {
  private execution = new CodeExecutionService()

  /**
   * Execute code with browser-compatible cancellation and error classification.
   */
  async build(
    code: string,
    config?: Partial<ExecutionConfig>,
    signal?: AbortSignal,
  ): Promise<BuildResult> {
    const merged = { ...DEFAULT_CONFIG, ...config }

    const validation = this.execution.validateCode(code)
    if (!validation.valid) {
      const errors: BuildError[] = validation.errors.map((message) => ({
        file: '<input>',
        message,
        type: 'other',
      }))
      return { success: false, errors, durationMs: 0 }
    }

    const start = performance.now()
    let execution: CodeExecutionResult

    try {
      execution = await this.execution.execute(code, merged, signal)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        errors: [{ file: '<input>', message, type: 'other' }],
        durationMs: performance.now() - start,
      }
    }

    if (execution.success) {
      return {
        success: true,
        output: execution.output,
        durationMs:
          execution.durationMs ?? Math.round(performance.now() - start),
      }
    }

    return {
      success: false,
      errors: [
        {
          file: '<input>',
          message: execution.error || 'Execution failed',
          type: classifyExecutionError(execution.error),
        },
      ],
      durationMs: execution.durationMs ?? Math.round(performance.now() - start),
    }
  }
}

function classifyExecutionError(errorMessage?: string): BuildError['type'] {
  if (!errorMessage) {
    return 'other'
  }

  const lower = errorMessage.toLowerCase()
  if (/\btimeout\b/.test(lower) || /\bcancelled\b/.test(lower)) {
    return 'timeout'
  }
  if (/memory|out of memory|alloc/.test(lower)) {
    return 'resource'
  }
  if (/syntax|referenceerror|typeerror|unexpected/.test(lower)) {
    return 'syntax'
  }
  return 'other'
}

/**
 * A deterministic, browser-compatible shim that runs the same execution path
 * used by the production service. It exists so browser/Vite tests can assert
 * behavior without depending on Node-only infrastructure.
 */
export function createBrowserBuildService(): BrowserBuildService {
  return new BrowserBuildService()
}
