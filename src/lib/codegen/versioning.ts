/**
 * File-level versioning integration for Phase 8
 *
 * This module connects in-memory file edits to the existing project/version
 * history architecture without duplicating it. A code project snapshot is
 * stored as a versioned entry alongside website specifications, so edits can
 * be recovered through the same version/recovery mechanisms.
 *
 * The snapshot format is intentionally stable:
 * - File manifest with file paths and contents.
 * - Project metadata (name, version, timestamps).
 * - Optional change summary.
 */

import type { FileManifest, GeneratedFile } from './types'
import type { ProjectFileSystem } from './fileSystem'

export interface CodeProjectSnapshot {
  kind: 'code-project'
  name: string
  version: string
  manifest: FileManifest
  changeSummary: string
  createdAt: number
}

/**
 * Create a versioned snapshot from a ProjectFileSystem instance.
 */
export function snapshotFromFileSystem(
  fs: ProjectFileSystem,
  changeSummary: string = 'File edit saved',
): CodeProjectSnapshot | null {
  const manifest = fs.getManifest()
  if (!manifest) {
    return null
  }

  return {
    kind: 'code-project',
    name: manifest.name,
    version: manifest.version,
    manifest: {
      name: manifest.name,
      version: manifest.version,
      files: manifest.files.map((file) => ({
        path: file.path,
        content: file.content,
        editable: file.editable,
        lastModified: file.lastModified,
      })),
      createdAt: manifest.createdAt,
      updatedAt: Date.now(),
    },
    changeSummary: changeSummary.slice(0, 240) || 'File edit saved',
    createdAt: Date.now(),
  }
}

/**
 * Restore a code project snapshot into a ProjectFileSystem instance.
 *
 * Only files present in the snapshot are restored; existing unrelated state
 * in the file system is preserved unless it conflicts with a restored path.
 */
export function restoreSnapshot(
  fs: ProjectFileSystem,
  snapshot: CodeProjectSnapshot,
): void {
  const files = snapshot.manifest.files
  for (const file of files) {
    if (fs.readFile(file.path) === null) {
      fs.createFile(file.path, file.content)
    } else {
      fs.updateFile(file.path, file.content)
    }
  }
}

/**
 * Convert a list of GeneratedFile entries into a map suitable for diffing.
 */
export function manifestToMap(files: GeneratedFile[]): Map<string, string> {
  return new Map(files.map((file) => [file.path, file.content]))
}

/**
 * Lightweight validation for a code project snapshot.
 */
export function validateSnapshot(snapshot: unknown): boolean {
  if (!snapshot || typeof snapshot !== 'object') {
    return false
  }

  const candidate = snapshot as Record<string, unknown>
  if (candidate.kind !== 'code-project') {
    return false
  }
  if (typeof candidate.name !== 'string' || candidate.name.length === 0) {
    return false
  }
  if (typeof candidate.version !== 'string') {
    return false
  }
  if (typeof candidate.changeSummary !== 'string') {
    return false
  }
  if (typeof candidate.createdAt !== 'number') {
    return false
  }

  const manifest = candidate.manifest as Record<string, unknown> | undefined
  if (!manifest || typeof manifest !== 'object') {
    return false
  }
  const files = manifest.files as
    | Array<{
        path?: unknown
        content?: unknown
        editable?: unknown
      }>
    | undefined
  if (!Array.isArray(files)) {
    return false
  }

  for (const file of files) {
    if (!file || typeof file !== 'object') {
      return false
    }
    const entry = file as Record<string, unknown>
    if (typeof entry.path !== 'string' || entry.path.length === 0) {
      return false
    }
    if (typeof entry.content !== 'string') {
      return false
    }
    if (entry.editable !== true && entry.editable !== false) {
      return false
    }
  }

  return true
}
