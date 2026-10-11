/**
 * Code generation editor module for Phase 8
 *
 * This module provides:
 * - File system management for generated projects
 * - Safe code execution using QuickJS-Emscripten
 * - File diff utilities
 * - Versioning integration with existing project history
 * - Type definitions for code editing
 *
 * Security features:
 * - No eval() or new Function()
 * - QuickJS sandbox with explicit limits
 * - Controlled file system operations
 * - Dependency allowlists
 * - Build error reporting
 * - Bounded repair attempts
 * - Execution cancellation via AbortSignal
 *
 * External runtime dependencies:
 * - quickjs-emscripten (MIT license) for JavaScript execution
 */

export { ProjectFileSystem } from './fileSystem'
export {
  CodeExecutionService,
  cancelExecution,
  runBoundedRepairAttempts,
} from './execution'
export {
  generateDiff,
  generateLineDiff,
  formatDiff,
  type FileChange,
  type DiffResult,
} from './diff'
export {
  toEditorFile,
  listEditorFiles,
  validateEditorCode,
  defaultCodeManifest,
  type EditorFile,
  type EditorState,
  type EditorValidation,
  type EditorBuild,
} from './editor'
export {
  snapshotFromFileSystem,
  restoreSnapshot,
  manifestToMap,
  validateSnapshot,
  type CodeProjectSnapshot,
} from './versioning'
export type {
  GeneratedFile,
  FileManifest,
  CodeExecutionResult,
  BuildResult,
  BuildError,
  ExecutionConfig,
  DEFAULT_EXECUTION_CONFIG,
} from './types'
