import { useState, type FormEvent, useCallback, useRef } from 'react'
import { WebsiteRenderer } from './features/website/WebsiteRenderer'
import { restaurantWebsite } from './features/website/examples'
import { type WebsiteSpec } from './features/website/schema'
import {
  createProjectState,
  type ProjectState,
  updateProjectName,
  applyEdit,
  undo,
  redo,
  canUndo,
  canRedo,
  getVersionHistory,
  restoreVersion,
} from './lib/projectState'
import { useZipExport } from './lib/export/useZipExport'

const examples = [
  'A cozy neighborhood bakery with an artisan menu',
  'A modern yoga studio with class schedules',
  'A bold portfolio for a digital illustrator',
]

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <main className="landing-shell">
      <header className="landing-nav">
        <a className="brand" href="#home" aria-label="Elora home">
          elora<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#examples">Examples</a>
          <button className="nav-cta" onClick={onStart} type="button">
            Open the builder <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </header>
      <section
        className="landing-hero"
        id="home"
        aria-labelledby="landing-title"
      >
        <p className="eyebrow">A WEBSITE BUILDER FOR YOUR NEXT IDEA</p>
        <h1 id="landing-title">
          From a thought
          <br />
          to <em>something real.</em>
        </h1>
        <p className="landing-description">
          Describe the website you imagine. Shape the idea, see a preview, and
          make it yours.
        </p>
        <button className="landing-cta" onClick={onStart} type="button">
          Start with a prompt <span aria-hidden="true">↗</span>
        </button>
        <p className="landing-disclaimer">
          Early prototype · Sample preview only · AI generation is not connected
        </p>
        <div
          className="landing-preview"
          aria-label="Illustrative sample website"
        >
          <span className="landing-preview-label">A SAMPLE WEBSITE CANVAS</span>
          <div className="landing-preview-card">
            <span>STUDIO / 01</span>
            <h2>
              Make room for
              <br />
              <em>something lovely.</em>
            </h2>
            <p>A thoughtful starting point for your next idea.</p>
            <span className="preview-decoration" aria-hidden="true" />
          </div>
        </div>
      </section>
      <section
        className="how-section"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <p className="eyebrow">A SIMPLE PLACE TO BEGIN</p>
        <h2 id="how-title">Your idea comes first.</h2>
        <div className="how-cards" id="examples">
          <article>
            <span>01</span>
            <h3>Describe it</h3>
            <p>Start with a few words about the site you want to make.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Explore a direction</h3>
            <p>
              Elora's prototype lets you try a prompt and see a sample layout.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Keep shaping it</h3>
            <p>
              Real generation and editing are part of the roadmap, not available
              yet.
            </p>
          </article>
        </div>
      </section>
      <footer className="landing-footer">
        <span>Elora · An early prototype</span>
        <span>No AI requests · No accounts · No saved projects</span>
      </footer>
    </main>
  )
}

function createDemoSpec(prompt: string): WebsiteSpec {
  const title = prompt.trim().replace(/[.!?]+$/, '')
  return {
    ...restaurantWebsite,
    sections: restaurantWebsite.sections.map((section) =>
      section.type === 'hero'
        ? {
            ...section,
            title,
            subtitle: 'Local sample preview · No AI was used.',
          }
        : section,
    ),
  }
}

export function App() {
  const [page, setPage] = useState<'landing' | 'builder'>('landing')
  const [prompt, setPrompt] = useState('')
  const [projectName, setProjectName] = useState('Untitled project')
  const [lastPrompt, setLastPrompt] = useState<string | null>(null)
  const [project, setProject] = useState<ProjectState>(() =>
    createProjectState({ initialSpec: restaurantWebsite }),
  )
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [editMessage, setEditMessage] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState('')
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const isGeneratingRef = useRef(false)

  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadZipFile,
  } = useZipExport()

  // Check if API is configured (in production) or running in demo mode
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const isApiConfigured = Boolean(apiBaseUrl)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (isGeneratingRef.current) return

      const nextPrompt = prompt.trim()
      if (!nextPrompt) {
        setStatus('error')
        setErrorMessage('Add a short description before starting.')
        return
      }

      setStatus('loading')
      setErrorMessage(null)
      isGeneratingRef.current = true

      if (!isApiConfigured) {
        // Local demo mode - no API configured
        window.setTimeout(() => {
          const newSpec = createDemoSpec(nextPrompt)
          setProject(
            applyEdit(project, newSpec, `Generated from: "${nextPrompt}"`)
              .state,
          )
          setProjectName(nextPrompt.slice(0, 80) || 'Untitled project')
          setLastPrompt(nextPrompt)
          setStatus('success')
          isGeneratingRef.current = false
        }, 180)
        return
      }

      try {
        // Call the real API endpoint
        const response = await fetch(`${apiBaseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: nextPrompt }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Generation failed')
        }

        setProject(
          applyEdit(project, data.spec, `Generated from: "${nextPrompt}"`)
            .state,
        )
        setProjectName(nextPrompt.slice(0, 80) || 'Untitled project')
        setLastPrompt(nextPrompt)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        )
      } finally {
        isGeneratingRef.current = false
      }
    },
    [prompt, project, apiBaseUrl, isApiConfigured],
  )

  const handleEdit = useCallback(async () => {
    const instruction = editInstruction.trim()
    if (!instruction) {
      setEditMessage('Add an edit instruction first.')
      setEditStatus('error')
      return
    }

    setEditStatus('loading')
    setEditMessage(null)

    if (!isApiConfigured) {
      // Local demo mode - simulate edit
      window.setTimeout(() => {
        const updatedSpec = {
          ...project.currentSpec,
          sections: project.currentSpec.sections.map((section) => {
            if (section.type === 'hero') {
              return {
                ...section,
                title:
                  instruction.length > 20
                    ? instruction
                    : `Updated: ${instruction}`,
              }
            }
            return section
          }),
        }
        const result = applyEdit(project, updatedSpec, `Edit: "${instruction}"`)
        setProject(result.state)
        setEditStatus('success')
        setEditMessage(result.error || 'Edit applied locally.')
        setEditInstruction('')
      }, 200)
      return
    }

    try {
      // Call the real API edit endpoint
      const response = await fetch(`${apiBaseUrl}/api/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpec: project.currentSpec,
          instruction,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Edit failed')
      }

      const result = applyEdit(
        project,
        data.spec,
        data.changeSummary || `Edit: "${instruction}"`,
      )
      setProject(result.state)
      setEditStatus('success')
      setEditMessage(result.error || 'Edit applied successfully.')
      setEditInstruction('')
    } catch (error) {
      setEditStatus('error')
      setEditMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    }
  }, [editInstruction, project, apiBaseUrl, isApiConfigured])

  const handleUndo = useCallback(() => {
    const result = undo(project)
    if (result.error) {
      setEditMessage(result.error)
      setEditStatus('error')
    } else {
      setProject(result.state)
      setEditStatus('success')
      setEditMessage('Restored previous version.')
    }
  }, [project])

  const handleRedo = useCallback(() => {
    const result = redo(project)
    if (result.error) {
      setEditMessage(result.error)
      setEditStatus('error')
    } else {
      setProject(result.state)
      setEditStatus('success')
      setEditMessage('Restored newer version.')
    }
  }, [project])

  const handleRestoreVersion = useCallback(
    (versionNumber: number) => {
      const result = restoreVersion(project, versionNumber)
      if (result.error) {
        setEditMessage(result.error)
        setEditStatus('error')
      } else {
        setProject(result.state)
        setEditStatus('success')
        setEditMessage(`Restored version ${versionNumber}.`)
        setShowVersionHistory(false)
      }
    },
    [project],
  )

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value
      setProjectName(newName)
      setProject(updateProjectName(project, newName))
    },
    [project],
  )

  const handleNameBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const result = updateProjectName(project, e.target.value)
      setProject(result)
      setProjectName(result.name)
    },
    [project],
  )

  const handleDownloadZip = useCallback(async () => {
    try {
      await downloadZipFile(project.currentSpec, projectName || 'elora-website')
    } catch {
      // Error is handled in hook
    }
  }, [downloadZipFile, project, projectName])

  const history = getVersionHistory(project)

  if (page === 'landing') {
    return <LandingPage onStart={() => setPage('builder')} />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            setPage('landing')
          }}
          aria-label="Elora home"
        >
          elora<span>.</span>
        </a>
        <div className="project-label">
          {showVersionHistory ? (
            <button
              className="version-panel-btn"
              onClick={() => setShowVersionHistory(false)}
              type="button"
            >
              ← Back to editor
            </button>
          ) : (
            <>
              <span className="status-dot" />
              <input
                className="project-name-input"
                value={projectName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                aria-label="Project name"
              />
              <span className="demo-label">DEMO</span>
            </>
          )}
        </div>
        <div className="topbar-actions">
          {!showVersionHistory && (
            <>
              <button
                className={`top-link ${canRedo(project) ? '' : 'disabled'}`}
                onClick={handleRedo}
                disabled={!canRedo(project)}
                type="button"
                title={canRedo(project) ? 'Redo' : 'Nothing to redo'}
              >
                Redo <span aria-hidden="true">↗</span>
              </button>
              <button
                className={`top-link ${canUndo(project) ? '' : 'disabled'}`}
                onClick={handleUndo}
                disabled={!canUndo(project)}
                type="button"
                title={canUndo(project) ? 'Undo' : 'Nothing to undo'}
              >
                Undo <span aria-hidden="true">↗</span>
              </button>
              <button
                className="top-link"
                onClick={() => setShowVersionHistory(true)}
                type="button"
                title="Version history"
              >
                History <span aria-hidden="true">↗</span>
              </button>
              <button
                className="top-link download-btn"
                onClick={handleDownloadZip}
                disabled={isDownloading || !project.currentSpec.sections.length}
                type="button"
                title="Download ZIP"
              >
                {isDownloading ? (
                  <span className="download-progress">
                    {Math.round(progress)}%
                  </span>
                ) : (
                  <>
                    Download ZIP <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="workspace">
        <section className="assistant-panel" aria-labelledby="assistant-title">
          <div className="panel-heading">
            <div className="eyebrow">YOUR CREATIVE SPACE</div>
            <h1 id="assistant-title">What would you like to create?</h1>
            <p>Describe your idea. Start with a prompt or try an example.</p>
          </div>

          <div className="conversation" aria-live="polite">
            <div className="assistant-message">
              <span className="avatar" aria-hidden="true">
                e
              </span>
              <div>
                <strong>Elora</strong>
                <p>
                  Your next website starts with an idea. What are you imagining?
                </p>
              </div>
            </div>
            {lastPrompt && (
              <div className="user-message">
                <span className="message-label">YOUR IDEA</span>
                <p>{lastPrompt}</p>
                <span className="demo-notice">
                  {isApiConfigured
                    ? 'AI-generated preview.'
                    : 'Local sample only. No AI was used.'}
                </span>
              </div>
            )}
            {project.versions.length > 0 && (
              <div className="version-indicator">
                <span className="version-badge">
                  v{history[history.length - 1].version}
                </span>
                <span className="version-summary">
                  {history[history.length - 1].changeSummary}
                </span>
              </div>
            )}
            {status === 'error' && (
              <p className="form-error" role="alert">
                {errorMessage || 'An error occurred. Please try again.'}
              </p>
            )}
            {status === 'loading' && (
              <p className="loading-message" role="status">
                {isApiConfigured
                  ? 'Generating your website…'
                  : 'Preparing your sample preview…'}
              </p>
            )}
            {status === 'success' && (
              <p className="success-message" role="status">
                {isApiConfigured
                  ? 'Website generated successfully!'
                  : 'Sample preview updated locally.'}
              </p>
            )}
            {editStatus === 'error' && (
              <p className="form-error" role="alert">
                {editMessage || 'An edit error occurred.'}
              </p>
            )}
            {editStatus === 'loading' && (
              <p className="loading-message" role="status">
                {isApiConfigured ? 'Applying edit…' : 'Applying edit locally…'}
              </p>
            )}
            {editStatus === 'success' && editMessage && (
              <p className="success-message" role="status">
                {editMessage}
              </p>
            )}
            {downloadError && (
              <p className="form-error" role="alert">
                Download error: {downloadError}
              </p>
            )}
          </div>

          <form className="prompt-form" id="prompt" onSubmit={handleSubmit}>
            <label htmlFor="prompt-input">Describe your website</label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value)
                if (status === 'error' || status === 'success')
                  setStatus('idle')
              }}
              rows={3}
              maxLength={500}
              placeholder="A modern restaurant with a seasonal menu and a warm, welcoming feel…"
              aria-describedby="prompt-help prompt-count"
            />
            <div className="form-bottom">
              <span id="prompt-help">
                {isApiConfigured
                  ? 'Generate a real website with AI.'
                  : "A local sample only — AI generation isn't connected."}
              </span>
              <span id="prompt-count">{prompt.length}/500</span>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || isGeneratingRef.current}
            >
              {status === 'loading'
                ? isApiConfigured
                  ? 'Generating…'
                  : 'Preparing…'
                : 'Generate website'}{' '}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <div className="edit-section">
            <label htmlFor="edit-input">Edit your website</label>
            <div className="edit-form-row">
              <textarea
                id="edit-input"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="e.g., Make the hero section darker"
                aria-describedby="edit-help"
              />
              <button
                type="button"
                onClick={handleEdit}
                disabled={editStatus === 'loading'}
              >
                {editStatus === 'loading' ? 'Editing…' : 'Apply edit'}{' '}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <span id="edit-help">
              Suggest changes to your existing website. This uses AI when
              configured.
            </span>
          </div>

          <div className="examples" aria-label="Example prompts">
            <span className="examples-title">NEED A STARTING POINT?</span>
            {examples.map((example) => (
              <button
                className="example-chip"
                key={example}
                onClick={() => setPrompt(example)}
                type="button"
              >
                {example} <span aria-hidden="true">+</span>
              </button>
            ))}
          </div>
          <p className="privacy-note">
            {isApiConfigured
              ? 'Your prompts are sent to the AI service to generate your website.'
              : 'Your prompt stays in this browser. This demo does not send or save it.'}
          </p>
        </section>

        <section className="preview-panel" aria-labelledby="preview-heading">
          <div className="preview-toolbar">
            <div>
              <span className="preview-kicker">LIVE PREVIEW</span>
              <h2 id="preview-heading">Your canvas</h2>
            </div>
            <span className="device-label">
              <span aria-hidden="true">▣</span> Desktop
            </span>
          </div>
          <div className="browser-frame">
            <div className="browser-bar" aria-hidden="true">
              <span />
              <span />
              <span />
              <div className="address-bar">your-website.preview</div>
            </div>
            <div
              className="rendered-preview"
              aria-label="Validated website preview"
            >
              <WebsiteRenderer spec={project.currentSpec} />
            </div>
          </div>
          <p className="preview-footnote">
            {isApiConfigured
              ? 'This is a real AI-generated website preview.'
              : 'This is a trusted renderer using a validated sample WebsiteSpec.'}
          </p>
        </section>
      </div>

      {showVersionHistory && (
        <div className="version-history-overlay">
          <div className="version-history-panel">
            <h2>Version History</h2>
            <div className="version-list">
              {history.map((version, index) => (
                <button
                  key={version.version}
                  className={`version-item ${index === history.length - 1 ? 'current' : ''}`}
                  onClick={() => handleRestoreVersion(version.version)}
                  type="button"
                >
                  <span className="version-number">v{version.version}</span>
                  <span className="version-date">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  <span className="version-summary">
                    {version.changeSummary}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="close-history-btn"
              onClick={() => setShowVersionHistory(false)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <span>Elora is an early prototype.</span>
        <span>
          {isApiConfigured
            ? 'AI-powered website generation.'
            : 'No accounts · No AI requests · No saved projects'}
        </span>
      </footer>
    </main>
  )
}
