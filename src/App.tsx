import { useState, type FormEvent } from 'react'

type DemoResult = {
  title: string
  description: string
  accent: string
  prompt: string
}

const examples = [
  'A cozy neighborhood bakery with an artisan menu',
  'A modern yoga studio with class schedules',
  'A bold portfolio for a digital illustrator',
]

const demoResult: DemoResult = {
  title: 'A place to slow down.',
  description: 'Thoughtful design, made for your next big idea.',
  accent: 'A little inspiration, made visible.',
  prompt: 'A small creative studio with an editorial feel',
}

function createDemoResult(prompt: string): DemoResult {
  const words = prompt.trim().replace(/[.!?]+$/, '')
  return {
    title: words.length > 0 ? words : demoResult.title,
    description: 'A first-look layout based on your description.',
    accent: 'Sample preview · Demo only',
    prompt: words,
  }
}

export function App() {
  const [prompt, setPrompt] = useState('')
  const [preview, setPreview] = useState<DemoResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPrompt = prompt.trim()
    if (!nextPrompt) {
      setStatus('error')
      return
    }

    setStatus('loading')
    // This deterministic local response is UI-only. It does not call an AI provider.
    window.setTimeout(() => {
      setPreview(createDemoResult(nextPrompt))
      setStatus('idle')
    }, 180)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Elora home">
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
            {preview && (
              <div className="user-message">
                <span className="message-label">YOUR IDEA</span>
                <p>{preview.prompt}</p>
                <span className="demo-notice">
                  Demo preview updated locally. No AI was used.
                </span>
              </div>
            )}
            {status === 'error' && (
              <p className="form-error" role="alert">
                Add a short description before starting.
              </p>
            )}
            {status === 'loading' && (
              <p className="loading-message" role="status">
                Preparing your sample preview…
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
                if (status === 'error') setStatus('idle')
              }}
              rows={3}
              maxLength={500}
              placeholder="A modern restaurant with a seasonal menu and a warm, welcoming feel…"
              aria-describedby="prompt-help prompt-count"
            />
            <div className="form-bottom">
              <span id="prompt-help">
                A local sample only — AI generation isn’t connected.
              </span>
              <span id="prompt-count">{prompt.length}/500</span>
            </div>
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Preparing…' : 'Show sample preview'}{' '}
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
            Your prompt stays in this browser. This demo does not send or save
            it.
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
            <div className="site-preview" aria-label="Sample website preview">
              <div className="site-nav">
                <span className="site-logo">STUDIO / 01</span>
                <span>ABOUT · WORK · CONTACT</span>
              </div>
              <div className="site-content">
                <span className="site-eyebrow">
                  {preview?.accent ?? 'A DIGITAL HOME FOR YOUR IDEA'}
                </span>
                <h3>{preview?.title ?? 'Make room for\nsomething lovely.'}</h3>
                <p>
                  {preview?.description ??
                    'A thoughtful starting point for a website that feels like you.'}
                </p>
                <span className="site-cta">
                  Explore the idea <span aria-hidden="true">↗</span>
                </span>
              </div>
              <div className="preview-orb" aria-hidden="true" />
              <span className="preview-caption">
                SAMPLE LAYOUT · NOT A GENERATED WEBSITE
              </span>
            </div>
          </div>
          <p className="preview-footnote">
            This sample is a visual placeholder, not a rendered website
            specification.
          </p>
        </section>
      </div>
      <footer className="app-footer">
        <span>Elora is an early prototype.</span>
        <span>No accounts · No AI requests · No saved projects</span>
      </footer>
    </main>
  )
}
