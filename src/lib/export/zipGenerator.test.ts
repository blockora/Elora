import { describe, expect, it } from 'vitest'
import { generateZip, validateExportProject } from './zipGenerator'
import { generateExportProject } from './projectGenerator'
import { restaurantWebsite } from '../../features/website/examples'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

describe('ZIP generator', () => {
  it('generates a valid ZIP blob', async () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')
    const zipBlob = await generateZip(project)

    expect(zipBlob.size).toBeGreaterThan(0)
    expect(zipBlob.size).toBeLessThan(500 * 1024) // Less than 500KB

    // Verify it's a valid ZIP by loading with JSZip
    const zip = await JSZip.loadAsync(zipBlob)

    // Get all file names from the ZIP
    const fileNames: string[] = []
    zip.forEach((relativePath, file) => {
      if (!file.dir) {
        fileNames.push(relativePath)
      }
    })

    expect(fileNames).toContain('package.json')
    expect(fileNames).toContain('index.html')
    expect(fileNames).toContain('README.md')
    expect(fileNames).toContain('src/data/website.json')
    expect(fileNames.length).toBeGreaterThan(20) // Should have many files
  })

  it('validation catches missing required files', () => {
    const project = {
      name: 'test',
      files: [
        { path: 'package.json', content: '{}' },
        // Missing other required files
      ],
    }

    const result = validateExportProject(project)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.some((e) => e.includes('Missing required file'))).toBe(
      true,
    )
  })

  it('validation detects invalid JSON', () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')

    // Corrupt the website.json
    const corruptedIndex = project.files.findIndex(
      (f) => f.path === 'src/data/website.json',
    )
    project.files[corruptedIndex] = {
      ...project.files[corruptedIndex],
      content: '{ invalid json }',
    }

    const result = validateExportProject(project)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('not valid JSON'))).toBe(true)
  })

  it('validation detects secrets in content', () => {
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

  it('extracted ZIP contains all expected files', async () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')
    const zipBlob = await generateZip(project)

    // Save and extract
    const tempDir = '/tmp/elora-export-test'
    const zipPath = path.join(tempDir, 'test.zip')
    const extractDir = path.join(tempDir, 'extracted')

    fs.mkdirSync(tempDir, { recursive: true })
    fs.writeFileSync(zipPath, Buffer.from(await zipBlob.arrayBuffer()))

    try {
      execSync(`unzip -o ${zipPath} -d ${extractDir}`, { stdio: 'pipe' })

      // Verify files exist
      const requiredFiles = [
        'package.json',
        'index.html',
        'README.md',
        'src/main.tsx',
        'src/App.tsx',
        'src/style.css',
        'src/data/website.json',
        'src/components/website/WebsiteRenderer.tsx',
        'src/components/website/SectionRenderer.tsx',
      ]

      for (const file of requiredFiles) {
        const fullPath = path.join(extractDir, file as string)
        expect(fs.existsSync(fullPath)).toBe(true)
      }

      // Verify package.json is valid
      const pkg = JSON.parse(
        fs.readFileSync(path.join(extractDir, 'package.json'), 'utf-8'),
      )
      expect(pkg.name).toBe('Test-Site')
      expect(pkg.dependencies).toHaveProperty('react')

      // Verify website.json is valid
      const spec = JSON.parse(
        fs.readFileSync(
          path.join(extractDir, 'src/data/website.json'),
          'utf-8',
        ),
      )
      expect(spec.name).toBe('Juniper Table')

      // Check no secrets
      const allFiles = fs.readdirSync(extractDir, { recursive: true })
      for (const file of allFiles) {
        if (
          (file as string).endsWith('.ts') ||
          (file as string).endsWith('.tsx') ||
          (file as string).endsWith('.js') ||
          (file as string).endsWith('.json')
        ) {
          const content = fs.readFileSync(
            path.join(extractDir, file as string),
            'utf-8',
          ) as string
          expect(content).not.toContain('sk-')
          expect(content).not.toContain('api_key')
          expect(content).not.toContain('password')
        }
      }
    } finally {
      // Cleanup
      try {
        execSync(`rm -rf ${tempDir}`)
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  it('ZIP size is reasonable for a simple site', async () => {
    const project = generateExportProject(restaurantWebsite, 'Test Site')
    const zipBlob = await generateZip(project)

    // Should be at least 1KB and less than 1MB
    expect(zipBlob.size).toBeGreaterThan(1024)
    expect(zipBlob.size).toBeLessThan(1024 * 1024)
  })
})
