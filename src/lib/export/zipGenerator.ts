import JSZip from 'jszip'
import type { ExportProject, ExportFile } from './projectGenerator'

export async function generateZip(project: ExportProject): Promise<Blob> {
  const zip = new JSZip()

  for (const file of project.files) {
    addFileToZip(zip, file)
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })
}

function addFileToZip(zip: JSZip, file: ExportFile): void {
  const pathParts = file.path.split('/')
  let currentFolder = zip

  for (let i = 0; i < pathParts.length - 1; i++) {
    const folderName = pathParts[i]
    if (!currentFolder.folder(folderName)) {
      currentFolder = currentFolder.folder(folderName)!
    } else {
      currentFolder = currentFolder.folder(folderName)!
    }
  }

  currentFolder.file(pathParts[pathParts.length - 1], file.content)
}

export async function downloadZip(
  zipBlob: Blob,
  projectName: string,
): Promise<void> {
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validateExportProject(project: ExportProject): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required files
  const requiredFiles = [
    'package.json',
    'index.html',
    'README.md',
    'src/main.tsx',
    'src/App.tsx',
    'src/style.css',
    'src/data/website.json',
  ]

  for (const required of requiredFiles) {
    const exists = project.files.some((f) => f.path === required)
    if (!exists) {
      errors.push(`Missing required file: ${required}`)
    }
  }

  // Check package.json is valid JSON
  const packageJsonFile = project.files.find((f) => f.path === 'package.json')
  if (packageJsonFile) {
    try {
      JSON.parse(packageJsonFile.content)
    } catch {
      errors.push('package.json is not valid JSON')
    }
  }

  // Check website.json is valid JSON
  const websiteJsonFile = project.files.find(
    (f) => f.path === 'src/data/website.json',
  )
  if (websiteJsonFile) {
    try {
      JSON.parse(websiteJsonFile.content)
    } catch {
      errors.push('src/data/website.json is not valid JSON')
    }
  }

  // Check for secrets in files
  for (const file of project.files) {
    if (containsSecrets(file.content)) {
      errors.push(`Potential secret found in ${file.path}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function containsSecrets(content: string): boolean {
  // Check for common secret patterns
  const secretPatterns = [
    /api[_-]?key\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}/i,
    /secret\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}/i,
    /password\s*[=:]\s*['"]?[a-zA-Z0-9_-]{8,}/i,
    /token\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}/i,
    /Bearer\s+[a-zA-Z0-9_-]{20,}/i,
  ]

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  return false
}
