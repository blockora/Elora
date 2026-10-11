import { describe, expect, it } from 'vitest'
import {
  snapshotFromFileSystem,
  restoreSnapshot,
  manifestToMap,
  validateSnapshot,
  type CodeProjectSnapshot,
} from '../versioning'
import { ProjectFileSystem } from '../fileSystem'

describe('CodeProjectSnapshot versioning', () => {
  it('creates a snapshot from a ProjectFileSystem instance', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/index.ts', 'export const x = 1')

    const snapshot = snapshotFromFileSystem(fs, 'Initial snapshot')

    expect(snapshot).not.toBeNull()
    expect(snapshot!.kind).toBe('code-project')
    expect(snapshot!.name).toBe('Test Project')
    expect(snapshot!.changeSummary).toBe('Initial snapshot')
    expect(snapshot!.manifest.files).toHaveLength(1)
    expect(snapshot!.manifest.files[0].path).toBe('src/index.ts')
    expect(snapshot!.manifest.files[0].content).toBe('export const x = 1')
  })

  it('returns null when the file system has no manifest', () => {
    const fs = new ProjectFileSystem()
    expect(snapshotFromFileSystem(fs)).toBeNull()
  })

  it('restores a snapshot into a file system', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Restored Project')

    const snapshot: CodeProjectSnapshot = {
      kind: 'code-project',
      name: 'Archived Project',
      version: '2.0.0',
      manifest: {
        name: 'Archived Project',
        version: '2.0.0',
        files: [
          { path: 'src/main.ts', content: 'console.log("hi")', editable: true },
          { path: 'README.md', content: '# Archived', editable: false },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      changeSummary: 'Restore archived project',
      createdAt: Date.now(),
    }

    restoreSnapshot(fs, snapshot)

    expect(fs.readFile('src/main.ts')).toBe('console.log("hi")')
    expect(fs.readFile('README.md')).toBe('# Archived')
  })

  it('updates an existing file when restoring a snapshot', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Editable Project')
    fs.createFile('src/app.ts', 'old content')

    const snapshot: CodeProjectSnapshot = {
      kind: 'code-project',
      name: 'Editable Project',
      version: '1.0.0',
      manifest: {
        name: 'Editable Project',
        version: '1.0.0',
        files: [{ path: 'src/app.ts', content: 'new content', editable: true }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      changeSummary: 'Update app',
      createdAt: Date.now(),
    }

    restoreSnapshot(fs, snapshot)

    expect(fs.readFile('src/app.ts')).toBe('new content')
  })

  it('converts a manifest into a diff-compatible map', () => {
    const files = [
      { path: 'src/a.ts', content: 'a', editable: true },
      { path: 'src/b.ts', content: 'b', editable: true },
    ]

    const map = manifestToMap(files)

    expect(map.get('src/a.ts')).toBe('a')
    expect(map.get('src/b.ts')).toBe('b')
    expect(map.size).toBe(2)
  })

  it('validates a well-formed snapshot', () => {
    const snapshot: CodeProjectSnapshot = {
      kind: 'code-project',
      name: 'Valid',
      version: '1.0.0',
      manifest: {
        name: 'Valid',
        version: '1.0.0',
        files: [{ path: 'src/index.ts', content: 'export {}', editable: true }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      changeSummary: 'Valid',
      createdAt: Date.now(),
    }

    expect(validateSnapshot(snapshot)).toBe(true)
  })

  it('rejects malformed snapshots', () => {
    expect(validateSnapshot(null)).toBe(false)
    expect(validateSnapshot({})).toBe(false)
    // A snapshot whose manifest.files is only a string array (not an
    // array of valid file entries) must still be rejected.
    expect(
      validateSnapshot({
        kind: 'code-project',
        name: 'Bad',
        version: '1.0.0',
        manifest: { name: 'Bad', version: '1.0.0', files: ['not-an-entry'] },
        changeSummary: 'Bad',
        createdAt: Date.now(),
      }),
    ).toBe(false)
  })

  it('preserves edit recoverability through the snapshot contract', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Recoverable Project')
    fs.createFile('src/app.ts', 'v1')
    fs.updateFile('src/app.ts', 'v2')

    const snapshot = snapshotFromFileSystem(fs, 'Saved v2')
    expect(snapshot).not.toBeNull()

    const restored = new ProjectFileSystem()
    restored.createProject('Recoverable Project')
    restoreSnapshot(restored, snapshot!)

    expect(restored.readFile('src/app.ts')).toBe('v2')
  })
})
