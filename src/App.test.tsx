import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the prompt entry with an accessible label', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup).toContain('aria-label="Main navigation"')
    expect(markup).toContain('for="prompt"')
    expect(markup).toContain('id="prompt"')
    expect(markup).toContain('Start creating')
    expect(markup).toContain('generation is not connected yet')
  })
})
