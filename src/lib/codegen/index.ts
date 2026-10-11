/**
 * Code generation editor module for Phase 8
 *
 * This module provides:
 * - File system management for generated projects
 * - Safe code execution using QuickJS-Emscripten
 * - File diff utilities
 * - Type definitions for code editing
 *
 * Security features:
 * - No eval() or new Function()
 * - QuickJS sandbox with explicit limits
 * - Controlled file system operations
 * - Dependency allowlists
 * - Build error reporting
 *
 * External runtime dependencies:
 * - quickjs-emscripten (MIT license) for JavaScript execution
 */

export { ProjectFileSystem } from './fileSystem'
export { CodeExecutionService } from './execution'
export {
  generateDiff,
  generateLineDiff,
  formatDiff,
  type FileChange,
  type DiffResult,
} from './diff'
export type {
  GeneratedFile,
  FileManifest,
  CodeExecutionResult,
  BuildResult,
  BuildError,
  ExecutionConfig,
  DEFAULT_EXECUTION_CONFIG,
} from './types'
