/**
 * Type definitions for the code generation editor
 *
 * This module defines the data structures for:
 * - File manifests
 * - Generated project files
 * - Code execution contexts
 * - Build/validation results
 */

export interface GeneratedFile {
  path: string
  content: string
  editable: boolean
  lastModified?: number
}

export interface FileManifest {
  name: string
  version: string
  files: GeneratedFile[]
  createdAt: number
  updatedAt: number
}

export interface CodeExecutionResult {
  success: boolean
  output?: string
  error?: string
  durationMs?: number
}

export interface BuildResult {
  success: boolean
  output?: string
  errors?: BuildError[]
  durationMs?: number
}

export interface BuildError {
  file: string
  line?: number
  column?: number
  message: string
  type: 'syntax' | 'dependency' | 'resource' | 'timeout' | 'other'
}

export interface ExecutionConfig {
  /** Maximum execution time in milliseconds */
  timeoutMs: number
  /** Maximum memory allocation in bytes (for Wasm runtimes) */
  maxMemoryBytes?: number
  /** Whether to allow network access */
  allowNetwork: boolean
  /** Whether to allow DOM access */
  allowDomAccess: boolean
  /** Allowed global functions/APIs */
  allowedGlobals: string[]
}

export const DEFAULT_EXECUTION_CONFIG: ExecutionConfig = {
  timeoutMs: 5000,
  maxMemoryBytes: 16 * 1024 * 1024, // 16MB
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
