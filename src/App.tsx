import { useState, type FormEvent, useCallback } from 'react'
import { WebsiteRenderer } from './features/website/WebsiteRenderer'
import { restaurantWebsite } from './features/website/examples'
import { type WebsiteSpec } from './features/website/schema'

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
  const [preview, setPreview] = useState<WebsiteSpec>(restaurantWebsite)
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check if API is configured (in production) or running in demo mode
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const isApiConfigured = Boolean(apiBaseUrl)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const nextPrompt = prompt.trim()
      if (!nextPrompt) {
        setStatus('error')
        setErrorMessage('Add a short description before starting.')
        return
      }

      setStatus('loading')
      setErrorMessage(null)

      if (!isApiConfigured) {
        // Local demo mode - no API configured
        window.setTimeout(() => {
          setPreview(createDemoSpec(nextPrompt))
          setPreviewPrompt(nextPrompt)
          setStatus('success')
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

        setPreview(data.spec)
        setPreviewPrompt(nextPrompt)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        )
      }
    },
    [prompt, apiBaseUrl, isApiConfigured],
  )

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
          <span className="status-dot" />
          Untitled project <span className="demo-label">DEMO</span>
        </div>
        <a className="top-link" href="#prompt">
          New idea <span aria-hidden="true">↗</span>
        </a>
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
            {previewPrompt && (
              <div className="user-message">
                <span className="message-label">YOUR IDEA</span>
                <p>{previewPrompt}</p>
                <span className="demo-notice">
                  {isApiConfigured
                    ? 'AI-generated preview.'
                    : 'Local sample only. No AI was used.'}
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
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading'
                ? isApiConfigured
                  ? 'Generating…'
                  : 'Preparing…'
                : 'Generate website'}{' '}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

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
              <WebsiteRenderer spec={preview} />
            </div>
          </div>
          <p className="preview-footnote">
            {isApiConfigured
              ? 'This is a real AI-generated website preview.'
              : 'This is a trusted renderer using a validated sample WebsiteSpec.'}
          </p>
        </section>
      </div>
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
