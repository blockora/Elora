import { describe, expect, it } from 'vitest'
import {
  toEditorFile,
  listEditorFiles,
  validateEditorCode,
  defaultCodeManifest,
} from '../editor'
import { ProjectFileSystem } from '../fileSystem'

describe('editor integration', () => {
  it('normalizes a GeneratedFile into an EditorFile', () => {
    const file = {
      path: 'src/App.tsx',
      content: 'export default {}',
      editable: true,
      lastModified: 12345,
    }

    expect(toEditorFile(file)).toEqual({
      path: 'src/App.tsx',
      content: 'export default {}',
      editable: true,
      lastModified: 12345,
    })
  })

  it('lists editor files from a ProjectFileSystem', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Editor Project')
    fs.createFile('src/main.ts', 'console.log(1)')
    fs.createFile('README.md', '# Editor Project')

    const files = listEditorFiles(fs)

    expect(files).toHaveLength(2)
    expect(files.map((f) => f.path)).toEqual(['src/main.ts', 'README.md'])
  })

  it('validates safe code content', () => {
    expect(validateEditorCode('src/app.ts', 'const x = 1').valid).toBe(true)
  })

  it('rejects path traversal attempts in validation', () => {
    expect(validateEditorCode('src/../secret.txt', 'content').valid).toBe(false)
    expect(validateEditorCode('src/\0bad.txt', 'content').valid).toBe(false)
  })

  it('rejects content that exceeds the maximum size', () => {
    const large = 'x'.repeat(500_001)
    expect(validateEditorCode('src/big.ts', large).valid).toBe(false)
  })

  it('provides a default code manifest', () => {
    const manifest = defaultCodeManifest('My Project')

    expect(manifest.name).toBe('My Project')
    expect(manifest.version).toBe('1.0.0')
    expect(manifest.files).toHaveLength(0)
  })

  it('keeps manifest files empty until files are added', () => {
    const manifest = defaultCodeManifest()
    expect(manifest.files).toEqual([])
  })
})
