/**
 * File diff utility for code editor
 *
 * This module provides utilities for:
 * - Comparing file contents
 * - Generating simple diffs
 * - Reporting changes
 */

export interface FileChange {
  type: 'added' | 'modified' | 'deleted'
  path: string
  oldContent?: string
  newContent?: string
}

export interface DiffResult {
  changes: FileChange[]
  changeCount: number
  addedCount: number
  modifiedCount: number
  deletedCount: number
}

/**
 * Compare two file manifests and generate a diff
 */
export function generateDiff(
  oldFiles: Map<string, string>,
  newFiles: Map<string, string>,
): DiffResult {
  const changes: FileChange[] = []

  // Check for modified and deleted files
  for (const [path, oldContent] of oldFiles) {
    const newContent = newFiles.get(path)

    if (newContent === undefined) {
      // File was deleted
      changes.push({
        type: 'deleted',
        path,
        oldContent,
      })
    } else if (oldContent !== newContent) {
      // File was modified
      changes.push({
        type: 'modified',
        path,
        oldContent,
        newContent,
      })
    }
  }

  // Check for added files
  for (const [path, newContent] of newFiles) {
    if (!oldFiles.has(path)) {
      changes.push({
        type: 'added',
        path,
        newContent,
      })
    }
  }

  const addedCount = changes.filter((c) => c.type === 'added').length
  const modifiedCount = changes.filter((c) => c.type === 'modified').length
  const deletedCount = changes.filter((c) => c.type === 'deleted').length

  return {
    changes,
    changeCount: changes.length,
    addedCount,
    modifiedCount,
    deletedCount,
  }
}

/**
 * Generate a simple line-by-line diff for a single file
 */
export function generateLineDiff(
  oldContent: string,
  newContent: string,
): { added: string[]; removed: string[]; unchanged: string[] } {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const added: string[] = []
  const removed: string[] = []
  const unchanged: string[] = []

  const maxLength = Math.max(oldLines.length, newLines.length)

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i] ?? ''
    const newLine = newLines[i] ?? ''

    if (oldLine === newLine) {
      unchanged.push(oldLine)
    } else {
      if (oldLine !== '') {
        removed.push(oldLine)
      }
      if (newLine !== '') {
        added.push(newLine)
      }
    }
  }

  return { added, removed, unchanged }
}

/**
 * Format a diff for display
 */
export function formatDiff(changes: FileChange[]): string {
  if (changes.length === 0) {
    return 'No changes'
  }

  const lines: string[] = []

  for (const change of changes) {
    lines.push(
      `\n${change.type === 'added' ? '+' : change.type === 'deleted' ? '-' : '~'} ${change.path}`,
    )

    if (change.type === 'modified' && change.oldContent && change.newContent) {
      const diff = generateLineDiff(change.oldContent, change.newContent)

      if (diff.removed.length > 0) {
        lines.push('  Removed:')
        for (const line of diff.removed.slice(0, 5)) {
          lines.push(`    - ${line}`)
        }
        if (diff.removed.length > 5) {
          lines.push(`    ... and ${diff.removed.length - 5} more lines`)
        }
      }

      if (diff.added.length > 0) {
        lines.push('  Added:')
        for (const line of diff.added.slice(0, 5)) {
          lines.push(`    + ${line}`)
        }
        if (diff.added.length > 5) {
          lines.push(`    ... and ${diff.added.length - 5} more lines`)
        }
      }
    } else if (change.type === 'added' && change.newContent) {
      lines.push('  Content:')
      const linesArr = change.newContent.split('\n')
      for (const line of linesArr.slice(0, 5)) {
        lines.push(`    + ${line}`)
      }
      if (linesArr.length > 5) {
        lines.push(`    ... and ${linesArr.length - 5} more lines`)
      }
    } else if (change.type === 'deleted' && change.oldContent) {
      lines.push('  Was:')
      const linesArr = change.oldContent.split('\n')
      for (const line of linesArr.slice(0, 5)) {
        lines.push(`    - ${line}`)
      }
      if (linesArr.length > 5) {
        lines.push(`    ... and ${linesArr.length - 5} more lines`)
      }
    }
  }

  return lines.join('\n')
}
