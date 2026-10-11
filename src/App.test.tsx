// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('builder prototype', () => {
  it('renders the prompt editor, examples, and clearly marked preview', () => {
    render(<App />)

    expect(screen.getByLabelText('Describe your website')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /cozy neighborhood bakery/i }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Your canvas' })).toBeTruthy()
    expect(screen.getByText(/not a generated website/i)).toBeTruthy()
    expect(screen.getByText(/AI generation isn’t connected/i)).toBeTruthy()
  })

  it('copies an example into the prompt without starting generation', () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole('button', { name: /cozy neighborhood bakery/i }),
    )

    expect(screen.getByLabelText('Describe your website')).toHaveProperty(
      'value',
      'A cozy neighborhood bakery with an artisan menu',
    )
    expect(screen.getByRole('heading', { name: 'Your canvas' })).toBeTruthy()
    expect(screen.queryByText(/Demo preview updated locally/i)).toBeNull()
  })

  it('shows an accessible error when submitted empty', () => {
    render(<App />)
    fireEvent.click(
      screen.getByRole('button', { name: /show sample preview/i }),
    )

    expect(screen.getByRole('alert').textContent).toMatch(
      /add a short description/i,
    )
  })

  it('updates the sample preview from a prompt without a network request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.useFakeTimers()
    render(<App />)
    fireEvent.change(screen.getByLabelText('Describe your website'), {
      target: { value: 'A quiet garden shop' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /show sample preview/i }),
    )

    expect(screen.getByRole('status').textContent).toMatch(
      /preparing your sample/i,
    )
    act(() => vi.advanceTimersByTime(180))

    expect(
      screen.getByRole('heading', { name: 'A quiet garden shop' }),
    ).toBeTruthy()
    expect(screen.getByText(/No AI was used/i)).toBeTruthy()
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
