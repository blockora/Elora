// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { restaurantWebsite } from './features/website/examples'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('builder prototype', () => {
  it('shows an informative landing page and main navigation', () => {
    render(<App />)

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /from a thought/i }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'How it works' }).getAttribute('href'),
    ).toBe('#how-it-works')
    expect(
      screen.getByRole('link', { name: 'Examples' }).getAttribute('href'),
    ).toBe('#examples')
    expect(document.getElementById('examples')).toBeTruthy()
    expect(screen.getByText(/AI generation is not connected/i)).toBeTruthy()
  })

  it('opens the builder from the landing-page primary action', () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole('button', { name: /start with a prompt/i }),
    )

    expect(screen.getByRole('heading', { name: 'Your canvas' })).toBeTruthy()
    expect(screen.getByLabelText('Describe your website')).toBeTruthy()
  })

  it('renders prompt examples and a clearly marked sample preview in the builder', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))

    expect(
      screen.getByRole('button', { name: /cozy neighborhood bakery/i }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Your canvas' })).toBeTruthy()
    expect(screen.getByText(/validated sample WebsiteSpec/i)).toBeTruthy()
    // Check for the demo notice text (with regular apostrophe)
    expect(screen.getByText(/AI generation isn't connected/i)).toBeTruthy()
  })

  it('shows the validated restaurant WebsiteSpec in the builder before prompt entry', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))
    expect(
      screen.getByRole('heading', { name: 'Gather around the table' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'A taste of the season' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('article', {
        name: `${restaurantWebsite.name} website preview`,
      }),
    ).toBeTruthy()
  })

  it('copies an example into the prompt without starting the demo', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))
    fireEvent.click(
      screen.getByRole('button', { name: /cozy neighborhood bakery/i }),
    )

    expect(screen.getByLabelText('Describe your website')).toHaveProperty(
      'value',
      'A cozy neighborhood bakery with an artisan menu',
    )
    expect(screen.queryByText(/Demo preview updated locally/i)).toBeNull()
  })

  it('shows an accessible error when the prompt is empty', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate website/i }))

    expect(screen.getByRole('alert').textContent).toMatch(
      /add a short description/i,
    )
  })

  it('updates sample preview text locally without making a network request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))
    fireEvent.change(screen.getByLabelText('Describe your website'), {
      target: { value: 'A quiet garden shop' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generate website/i }))

    expect(screen.getByRole('status').textContent).toMatch(
      /preparing your sample/i,
    )
    act(() => vi.advanceTimersByTime(180))

    expect(
      screen.getByRole('heading', { name: 'A quiet garden shop' }),
    ).toBeTruthy()
    expect(screen.getByRole('status').textContent).toMatch(
      /sample preview updated locally/i,
    )
    expect(screen.getByText('Local sample only. No AI was used.')).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'A quiet garden shop' }),
    ).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('builder accessibility', () => {
  it('has no interactive element without an accessible name in the builder', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))

    const buttons = container.querySelectorAll('button')
    const unnamed = Array.from(buttons).filter(
      (button) =>
        !button.textContent?.trim() && !button.getAttribute('aria-label'),
    )
    expect(unnamed).toHaveLength(0)
  })

  it('topbar buttons are present and undo/redo are initially disabled', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))

    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /redo/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /history/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /code/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /download zip/i })).toBeTruthy()

    // Initially no undo/redo available
    const undoButton = screen.getByRole('button', { name: /undo/i })
    const redoButton = screen.getByRole('button', { name: /redo/i })
    expect((undoButton as HTMLButtonElement).disabled).toBe(true)
    expect((redoButton as HTMLButtonElement).disabled).toBe(true)
  })

  it('version history panel shows version buttons and can be closed', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }))
    fireEvent.click(screen.getByRole('button', { name: /history/i }))

    expect(
      screen.getByRole('heading', { name: /version history/i }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: /v1/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /close/i })).toBeTruthy()
  })
})
