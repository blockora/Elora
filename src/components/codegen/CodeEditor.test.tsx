// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CodeEditor } from './CodeEditor'
import { ProjectFileSystem } from '../../lib/codegen/fileSystem'

afterEach(() => {
  cleanup()
})

describe('CodeEditor accessibility and interactive behavior', () => {
  it('renders file and build mode toggles with accessible labels', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/main.ts', 'console.log(1)')

    render(<CodeEditor fileSystem={fs} />)

    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /build/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /source editor/i })).toBeTruthy()
  })

  it('shows a project files tree with selectable file buttons', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/main.ts', 'console.log(1)')
    fs.createFile('README.md', '# Test')

    render(<CodeEditor fileSystem={fs} />)

    expect(screen.getByRole('listbox')).toBeTruthy()
    // File buttons include an icon prefix; match by the path text
    expect(screen.getByRole('button', { name: /main\.ts/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /readme\.md/i })).toBeTruthy()
  })

  it('marks the selected file button and allows selection', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/main.ts', 'console.log(1)')
    fs.createFile('README.md', '# Test')

    render(<CodeEditor fileSystem={fs} />)

    const mainButton = screen.getByRole('button', { name: /main\.ts/i })
    const readmeButton = screen.getByRole('button', { name: /readme\.md/i })

    // Initially main.ts is selected
    expect(mainButton.getAttribute('aria-pressed')).toBe('true')
    expect(readmeButton.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(readmeButton)
    expect(readmeButton.getAttribute('aria-pressed')).toBe('true')
    expect(mainButton.getAttribute('aria-pressed')).toBe('false')
  })

  it('surfaces build status with role=status when build is started', async () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/main.ts', 'console.log(1)')

    render(<CodeEditor fileSystem={fs} />)

    // Select the file first
    const mainButton = screen.getByRole('button', { name: /main\.ts/i })
    fireEvent.click(mainButton)

    // Switch to build mode, which shows the 'Run build' button
    const buildModeButton = screen.getByRole('button', { name: /build/i })
    fireEvent.click(buildModeButton)

    const runBuildButton = screen.getByRole('button', { name: /run build/i })
    expect(runBuildButton).toBeTruthy()
    fireEvent.click(runBuildButton)

    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('has no interactive element without an accessible name', () => {
    const fs = new ProjectFileSystem()
    fs.createProject('Test Project')
    fs.createFile('src/main.ts', 'console.log(1)')

    const { container } = render(<CodeEditor fileSystem={fs} />)

    const buttons = container.querySelectorAll('button')
    const unnamed = Array.from(buttons).filter(
      (button) =>
        !button.textContent?.trim() && !button.getAttribute('aria-label'),
    )
    expect(unnamed).toHaveLength(0)
  })
})
