import { describe, expect, it } from 'vitest'
import {
  generateDiff,
  generateLineDiff,
  formatDiff,
  type FileChange,
} from '../diff'

describe('Diff utilities', () => {
  describe('generateDiff', () => {
    it('detects added files', () => {
      const oldFiles = new Map<string, string>()
      const newFiles = new Map<string, string>([['src/App.tsx', 'content']])

      const diff = generateDiff(oldFiles, newFiles)

      expect(diff.changeCount).toBe(1)
      expect(diff.addedCount).toBe(1)
      expect(diff.modifiedCount).toBe(0)
      expect(diff.deletedCount).toBe(0)
      expect(diff.changes[0].type).toBe('added')
      expect(diff.changes[0].path).toBe('src/App.tsx')
    })

    it('detects modified files', () => {
      const oldFiles = new Map<string, string>([['src/App.tsx', 'original']])
      const newFiles = new Map<string, string>([['src/App.tsx', 'modified']])

      const diff = generateDiff(oldFiles, newFiles)

      expect(diff.changeCount).toBe(1)
      expect(diff.addedCount).toBe(0)
      expect(diff.modifiedCount).toBe(1)
      expect(diff.changes[0].type).toBe('modified')
      expect(diff.changes[0].oldContent).toBe('original')
      expect(diff.changes[0].newContent).toBe('modified')
    })

    it('detects deleted files', () => {
      const oldFiles = new Map<string, string>([['src/App.tsx', 'content']])
      const newFiles = new Map<string, string>()

      const diff = generateDiff(oldFiles, newFiles)

      expect(diff.changeCount).toBe(1)
      expect(diff.addedCount).toBe(0)
      expect(diff.modifiedCount).toBe(0)
      expect(diff.deletedCount).toBe(1)
      expect(diff.changes[0].type).toBe('deleted')
    })

    it('detects multiple changes', () => {
      const oldFiles = new Map<string, string>([
        ['src/App.tsx', 'original'],
        ['src/main.tsx', 'main'],
      ])
      const newFiles = new Map<string, string>([
        ['src/App.tsx', 'updated'],
        ['src/new.ts', 'new file'],
      ])

      const diff = generateDiff(oldFiles, newFiles)

      expect(diff.changeCount).toBe(3)
      expect(diff.addedCount).toBe(1)
      expect(diff.modifiedCount).toBe(1)
      expect(diff.deletedCount).toBe(1)
    })

    it('returns empty diff for identical files', () => {
      const files = new Map<string, string>([['src/App.tsx', 'content']])

      const diff = generateDiff(files, files)

      expect(diff.changeCount).toBe(0)
      expect(diff.changes).toHaveLength(0)
    })
  })

  describe('generateLineDiff', () => {
    it('detects added and removed lines', () => {
      const oldContent = 'line1\nline2\nline3'
      const newContent = 'line1\nline2-modified\nline3\nline4'

      const diff = generateLineDiff(oldContent, newContent)

      expect(diff.removed).toContain('line2')
      expect(diff.added).toContain('line2-modified')
      expect(diff.added).toContain('line4')
    })

    it('handles empty content', () => {
      const diff = generateLineDiff('', 'new content')

      expect(diff.removed).toHaveLength(0)
      expect(diff.added).toContain('new content')
    })

    it('handles identical content', () => {
      const content = 'same\ncontent'

      const diff = generateLineDiff(content, content)

      expect(diff.removed).toHaveLength(0)
      expect(diff.added).toHaveLength(0)
      expect(diff.unchanged).toContain('same')
      expect(diff.unchanged).toContain('content')
    })
  })

  describe('formatDiff', () => {
    it('formats empty diff', () => {
      const result = formatDiff([])
      expect(result).toBe('No changes')
    })

    it('formats added file', () => {
      const changes: FileChange[] = [
        {
          type: 'added',
          path: 'src/new.ts',
          newContent: 'const x = 1',
        },
      ]

      const result = formatDiff(changes)
      expect(result).toContain('+ src/new.ts')
      expect(result).toContain('Content:')
    })

    it('formats modified file', () => {
      const changes: FileChange[] = [
        {
          type: 'modified',
          path: 'src/App.tsx',
          oldContent: 'old',
          newContent: 'new',
        },
      ]

      const result = formatDiff(changes)
      expect(result).toContain('~ src/App.tsx')
      expect(result).toContain('Removed:')
      expect(result).toContain('Added:')
    })
  })
})
