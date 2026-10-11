import { useCallback } from 'react'
import type { EditorFile } from '../../lib/codegen/editor'

interface FileTreeProps {
  files: EditorFile[]
  selectedPath: string | null
  onSelect: (path: string) => void
}

export function FileTree({ files, selectedPath, onSelect }: FileTreeProps) {
  const handleSelect = useCallback(
    (path: string) => {
      onSelect(path)
    },
    [onSelect],
  )

  if (files.length === 0) {
    return (
      <div className="file-tree-empty">
        <p>No files</p>
      </div>
    )
  }

  return (
    <ul className="file-tree" role="listbox" aria-label="Project files">
      {files.map((file) => (
        <li key={file.path}>
          <button
            className={`file-tree-item ${selectedPath === file.path ? 'selected' : ''}`}
            type="button"
            role="option"
            aria-selected={selectedPath === file.path}
            onClick={() => handleSelect(file.path)}
          >
            <span className="file-tree-icon" aria-hidden="true">
              {file.editable ? '⎔' : '🔒'}
            </span>
            <span className="file-tree-name">{file.path}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
