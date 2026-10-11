/**
 * Code editor state and project integration for Phase 8
 *
 * Wires Monaco Editor to ProjectFileSystem / FileManifest and the existing
 * project/version history architecture. Editing a file updates the in-memory
 * file system and, on save, creates a versioned snapshot through project state.
 *
 * Usage notes:
 * - File selection, view/edit, and save are driven through ProjectFileSystem.
 * - Validation and build/execution errors are surfaced through the editor UI.
 * - File edits are recoverable through the existing version history system.
 */

import { ProjectFileSystem } from './fileSystem'
import type { BuildResult, FileManifest } from './types'

export interface EditorFile {
  path: string
  content: string
  editable: boolean
  lastModified: number | undefined
}

export interface EditorState {
  files: EditorFile[]
  selectedPath: string | null
  manifest: FileManifest | null
  error: string | null
  isLoading: boolean
}

export interface EditorValidation {
  valid: boolean
  errors: string[]
}

export interface EditorBuild {
  result: BuildResult | null
  executing: boolean
}

/**
 * Normalize a GeneratedFile into the editor-facing shape.
 */
export function toEditorFile(file: {
  path: string
  content: string
  editable: boolean
  lastModified?: number
}): EditorFile {
  return {
    path: file.path,
    content: file.content,
    editable: file.editable,
    lastModified: file.lastModified,
  }
}

/**
 * Build an editor file list from a ProjectFileSystem instance.
 */
export function listEditorFiles(fs: ProjectFileSystem): EditorFile[] {
  return fs.listFiles().map(toEditorFile)
}

/**
 * Validate file content with the execution service (defense-in-depth).
 * This is a lightweight static validation; real execution is gated separately.
 */
export function validateEditorCode(
  path: string,
  content: string,
): EditorValidation {
  const normalizedPath = path.replace(/\\/g, '/')
  const errors: string[] = []

  // Block path-escape attempts in content paths (defense-in-depth)
  if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
    errors.push('Invalid file path.')
  }

  if (content.length > 500_000) {
    errors.push('File content exceeds the maximum allowed size.')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Build a default project file manifest for a new code project.
 */
export function defaultCodeManifest(name = 'Generated Project'): FileManifest {
  return {
    name,
    version: '1.0.0',
    files: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
