import { describe, expect, it } from 'vitest'
import { generateExportProject, type ExportProject } from './projectGenerator'
import { restaurantWebsite } from '../../features/website/examples'
import { validateExportProject } from './zipGenerator'

describe('project generator', () => {
  it('generates a complete export project structure', () => {
    const project = generateExportProject(restaurantWebsite, 'Juniper Table')

    expect(project.name).toBe('Juniper-Table')
    expect(project.files.length).toBeGreaterThan(25)

    // Check required files exist
    const filePaths = project.files.map((f) => f.path)
    expect(filePaths).toContain('package.json')
    expect(filePaths).toContain('index.html')
    expect(filePaths).toContain('README.md')
    expect(filePaths).toContain('src/main.tsx')
    expect(filePaths).toContain('src/App.tsx')
    expect(filePaths).toContain('src/style.css')
    expect(filePaths).toContain('src/data/website.json')
    expect(filePaths).toContain('src/components/website/WebsiteRenderer.tsx')
    expect(filePaths).toContain('src/components/website/SectionRenderer.tsx')
    expect(filePaths).toContain('src/types/index.ts')
  })

  it('includes all section components', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const filePaths = project.files.map((f) => f.path)
    expect(filePaths).toContain(
      'src/components/website/sections/HeroSection.tsx',
    )
    expect(filePaths).toContain(
      'src/components/website/sections/FeaturesSection.tsx',
    )
    expect(filePaths).toContain(
      'src/components/website/sections/FooterSection.tsx',
    )
    expect(filePaths).toContain('src/components/website/sections/index.ts')
  })

  it('sanitizes project name for filesystem use', () => {
    const project1 = generateExportProject(
      restaurantWebsite,
      'My Awesome Site!',
    )
    expect(project1.name).toBe('My-Awesome-Site')

    const project2 = generateExportProject(restaurantWebsite, '  Test   Site  ')
    expect(project2.name).toBe('Test-Site')

    const project3 = generateExportProject(restaurantWebsite, '!!!')
    expect(project3.name).toBe('elora-website')
  })

  it('includes website spec in src/data/website.json', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const websiteJsonFile = project.files.find(
      (f) => f.path === 'src/data/website.json',
    )
    expect(websiteJsonFile).toBeDefined()

    const spec = JSON.parse(websiteJsonFile!.content)
    expect(spec.name).toBe('Juniper Table')
    expect(spec.sections).toHaveLength(4)
  })

  it('generates valid package.json', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const packageJsonFile = project.files.find((f) => f.path === 'package.json')
    expect(packageJsonFile).toBeDefined()

    const pkg = JSON.parse(packageJsonFile!.content)
    expect(pkg.name).toBe('Test-Site')
    expect(pkg.dependencies).toHaveProperty('react')
    expect(pkg.dependencies).toHaveProperty('react-dom')
    expect(pkg.scripts).toHaveProperty('dev')
    expect(pkg.scripts).toHaveProperty('build')
  })

  it('generates index.html with React entry point', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const indexHtmlFile = project.files.find((f) => f.path === 'index.html')
    expect(indexHtmlFile).toBeDefined()
    expect(indexHtmlFile!.content).toContain('<div id="root"></div>')
    expect(indexHtmlFile!.content).toContain('/src/main.tsx')
  })

  it('generates App.tsx that imports WebsiteRenderer', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const appFile = project.files.find((f) => f.path === 'src/App.tsx')
    expect(appFile).toBeDefined()
    expect(appFile!.content).toContain('WebsiteRenderer')
    expect(appFile!.content).toContain('website.json')
  })

  it('generates valid README with project name', () => {
    const project = generateExportProject(restaurantWebsite, 'Juniper Table')

    const readmeFile = project.files.find((f) => f.path === 'README.md')
    expect(readmeFile).toBeDefined()
    expect(readmeFile!.content).toContain('# Juniper Table')
    expect(readmeFile!.content).toContain('npm install')
    expect(readmeFile!.content).toContain('npm run dev')
  })

  it('validation passes for valid project', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')
    const result = validateExportProject(project)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('validation fails when required files are missing', () => {
    const project: ExportProject = {
      name: 'test',
      files: [
        { path: 'package.json', content: '{}' },
        // Missing other required files
      ],
    }

    const result = validateExportProject(project)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('validation detects secrets in file content', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    // Add a file with a fake API key
    const maliciousFile = {
      path: 'src/config.ts',
      content: 'export const API_KEY = "sk-my-secret-api-key-1234567890abcdef"',
    }

    const result = validateExportProject({
      ...project,
      files: [...project.files, maliciousFile],
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Potential secret'))).toBe(true)
  })

  it('validation checks JSON files are valid', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    // Corrupt the website.json
    const corruptedIndex = project.files.findIndex(
      (f) => f.path === 'src/data/website.json',
    )
    if (corruptedIndex !== -1) {
      project.files[corruptedIndex] = {
        ...project.files[corruptedIndex],
        content: '{ invalid json }',
      }
    }

    const result = validateExportProject(project)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('not valid JSON'))).toBe(true)
  })

  it('includes favicon in public folder', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    const faviconFile = project.files.find(
      (f) => f.path === 'public/favicon.svg',
    )
    expect(faviconFile).toBeDefined()
    expect(faviconFile!.content).toContain('<svg')
  })
})
