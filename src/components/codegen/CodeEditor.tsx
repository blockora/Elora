import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { ProjectFileSystem } from '../../lib/codegen/fileSystem'
import { validateEditorCode, listEditorFiles } from '../../lib/codegen/editor'
import { BrowserBuildService } from '../../lib/codegen/build'
import type { BuildResult, BuildError } from '../../lib/codegen/types'

interface CodeEditorProps {
  fileSystem: ProjectFileSystem
  onChange?: (files: Map<string, string>) => void
  onSave?: (fileSystem: ProjectFileSystem) => void
}

type EditorMode = 'file' | 'build'

export function CodeEditor({ fileSystem, onChange, onSave }: CodeEditorProps) {
  const [mode, setMode] = useState<EditorMode>('file')
  const [files, setFiles] = useState<ReturnType<typeof listEditorFiles>>(() =>
    listEditorFiles(fileSystem),
  )
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [validation, setValidation] = useState<ReturnType<
    typeof validateEditorCode
  > | null>(null)
  const [buildResult, setBuildResult] = useState<{
    status: 'idle' | 'running'
    result?: BuildResult
    error?: string
  }>({ status: 'idle' })
  const editorRef = useRef<unknown>(null)
  const buildServiceRef = useRef(new BrowserBuildService())

  const selectedFile = files.find((file) => file.path === selectedPath) ?? null

  useEffect(() => {
    const next = listEditorFiles(fileSystem)
    setFiles(next)

    if (selectedPath && !next.some((file) => file.path === selectedPath)) {
      setSelectedPath(next[0]?.path ?? null)
    } else if (!selectedPath && next.length > 0) {
      setSelectedPath(next[0].path)
    }
  }, [fileSystem, selectedPath])

  useEffect(() => {
    if (selectedFile) {
      setEditorContent(selectedFile.content)
    }
  }, [selectedFile])

  useEffect(() => {
    if (selectedPath && editorContent) {
      const validation = validateEditorCode(selectedPath, editorContent)
      setValidation(validation)
    } else {
      setValidation(null)
    }
  }, [selectedPath, editorContent])

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor
    if (typeof editor === 'object' && editor != null && 'focus' in editor) {
      ;(editor as { focus: () => void }).focus()
    }
  }, [])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const content = value ?? ''
      setEditorContent(content)
      if (selectedPath) {
        onChange?.(new Map([[selectedPath, content]]))
      }
    },
    [selectedPath, onChange],
  )

  const handleFileSelect = useCallback((path: string) => {
    setSelectedPath(path)
    setMode('file')
    setBuildResult({ status: 'idle' })
    setValidation(null)
  }, [])

  const handleSave = useCallback(() => {
    if (!selectedPath) return
    const ok = fileSystem.updateFile(selectedPath, editorContent)
    if (!ok) {
      setBuildResult((prev) => ({
        ...prev,
        status: 'idle',
        error: 'Save failed: file not found or not editable.',
      }))
      return
    }
    onSave?.(fileSystem)
    setFiles(listEditorFiles(fileSystem))
    setBuildResult((prev) => ({
      ...prev,
      status: 'idle',
      result: { success: true, output: 'Saved.', durationMs: 0 },
    }))
  }, [selectedPath, editorContent, fileSystem, onSave])

  const handleBuild = useCallback(async () => {
    if (!editorContent) {
      setBuildResult((prev) => ({
        ...prev,
        status: 'idle',
        error: 'No code to build.',
      }))
      return
    }

    setBuildResult({ status: 'running' })
    try {
      const result = await buildServiceRef.current.build(
        editorContent,
        undefined,
        undefined,
      )
      setBuildResult({ status: 'idle', result })
    } catch (error) {
      setBuildResult({
        status: 'idle',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }, [editorContent])

  const handleReset = useCallback(() => {
    if (selectedFile) {
      setEditorContent(selectedFile.content)
    }
    setBuildResult({ status: 'idle' })
    setValidation(null)
  }, [selectedFile])

  const buildErrors: BuildError[] | null = buildResult.result?.success
    ? null
    : (buildResult.result?.errors ?? null)

  return (
    <div className="codegen-panel">
      <header className="codegen-header">
        <div className="codegen-title">
          <span className="codegen-eyebrow">CODE EDITOR</span>
          <h2>Source editor</h2>
        </div>
        <div className="codegen-actions">
          <button
            className={`codegen-mode-btn ${mode === 'file' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('file')}
          >
            Edit
          </button>
          <button
            className={`codegen-mode-btn ${mode === 'build' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('build')}
          >
            Build
          </button>
        </div>
      </header>

      {files.length === 0 ? (
        <div className="codegen-empty">
          <p>No project files yet.</p>
          <p className="codegen-empty-hint">
            Open a code project to edit its source here.
          </p>
        </div>
      ) : (
        <div className="codegen-layout">
          <aside className="codegen-tree" aria-label="Project files">
            <ul className="codegen-tree-list">
              {files.map((file) => (
                <li key={file.path}>
                  <button
                    className={`codegen-tree-item ${selectedPath === file.path ? 'selected' : ''}`}
                    type="button"
                    onClick={() => handleFileSelect(file.path)}
                    aria-pressed={selectedPath === file.path}
                  >
                    <span className="codegen-tree-icon" aria-hidden="true">
                      {file.editable ? '⎔' : '🔒'}
                    </span>
                    <span className="codegen-tree-path">{file.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="codegen-editor-wrap">
            {selectedPath ? (
              <>
                <div className="codegen-toolbar">
                  <span className="codegen-file-label">
                    {selectedPath}
                    {fileSystem.readFile(selectedPath) !== editorContent
                      ? ' (unsaved)'
                      : ''}
                  </span>
                  <div className="codegen-toolbar-actions">
                    <button
                      className="codegen-btn secondary"
                      type="button"
                      onClick={handleReset}
                      disabled={selectedFile?.content === editorContent}
                    >
                      Reset
                    </button>
                    <button
                      className="codegen-btn primary"
                      type="button"
                      onClick={mode === 'file' ? handleSave : handleBuild}
                      disabled={
                        mode === 'file'
                          ? !validation?.valid
                          : buildResult.status === 'running' || !editorContent
                      }
                    >
                      {mode === 'file' ? 'Save' : 'Run build'}
                    </button>
                  </div>
                </div>

                {mode === 'file' ? (
                  <Editor
                    height="100%"
                    language="typescript"
                    theme="vs-dark"
                    value={editorContent}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      fontFamily: 'ui-monospace, monospace',
                      tabSize: 2,
                      wordWrap: 'on',
                      readOnly: !selectedFile?.editable,
                      glyphMargin: false,
                      folding: false,
                      renderLineHighlight: 'none',
                      scrollbar: {
                        horizontal: 'hidden',
                        vertical: 'hidden',
                      },
                    }}
                    loading={
                      <div className="codegen-loading">Loading editor…</div>
                    }
                  />
                ) : (
                  <div className="codegen-build-output">
                    {buildResult.status === 'running' && (
                      <div className="codegen-status running" role="status">
                        Running build…
                      </div>
                    )}
                    {buildResult.status === 'idle' &&
                      buildResult.result?.success && (
                        <div className="codegen-status success" role="status">
                          Build succeeded · {buildResult.result.durationMs ?? 0}
                          ms
                          {buildResult.result.output && (
                            <pre className="codegen-output">
                              {buildResult.result.output}
                            </pre>
                          )}
                        </div>
                      )}
                    {buildResult.status === 'idle' &&
                      buildErrors &&
                      buildErrors.length > 0 && (
                        <div className="codegen-status failure" role="alert">
                          <div className="codegen-errors">
                            {buildErrors.map((error, index) => (
                              <div key={index} className="codegen-error">
                                <span className="codegen-error-kind">
                                  {error.type}
                                </span>
                                <span className="codegen-error-msg">
                                  {error.file}
                                  {error.line != null ? `:${error.line}` : ''}
                                  {error.column != null
                                    ? `:${error.column}`
                                    : ''}
                                </span>
                                <span className="codegen-error-text">
                                  {error.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {buildResult.status === 'idle' && buildResult.error && (
                      <div className="codegen-status failure" role="alert">
                        {buildResult.error}
                      </div>
                    )}
                    {buildResult.status === 'idle' &&
                      !buildResult.result &&
                      !buildResult.error && (
                        <div className="codegen-status idle">
                          Edit code and run a build to see output here.
                        </div>
                      )}
                  </div>
                )}
              </>
            ) : (
              <div className="codegen-placeholder">
                Select a file to view or edit its source.
              </div>
            )}
          </div>
        </div>
      )}

      {validation?.errors.length ? (
        <div className="codegen-validation" role="alert">
          <span className="codegen-validation-label">Validation:</span>{' '}
          {validation.errors.map((message, index) => (
            <span key={index}>
              {index > 0 ? ', ' : ''}
              {message}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
