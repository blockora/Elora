/**
 * In-memory file system for code generation editor
 *
 * This module provides a controlled, in-memory file system for:
 * - Creating, reading, updating, and deleting project files
 * - Validating file paths and content
 * - Maintaining file manifests
 * - Enforcing dependency allowlists
 *
 * This does NOT execute arbitrary code. It provides a safe file management layer
 * that can be used with a sandbox runtime (e.g., QuickJS-Emscripten) for execution.
 */

import type { GeneratedFile, FileManifest } from './types'

export class ProjectFileSystem {
  private files: Map<string, GeneratedFile> = new Map()
  private manifest: FileManifest | null = null
  private allowedDependencies: Set<string>

  constructor(allowedDependencies: string[] = []) {
    this.allowedDependencies = new Set(allowedDependencies)
  }

  /**
   * Initialize a new project with a manifest
   */
  createProject(name: string, version: string = '1.0.0'): FileManifest {
    this.manifest = {
      name,
      version,
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return this.manifest
  }

  /**
   * Create a new file in the project
   */
  createFile(path: string, content: string): boolean {
    if (!this.validateFilePath(path)) {
      return false
    }

    if (this.files.has(path)) {
      return false // File already exists
    }

    const file: GeneratedFile = {
      path,
      content,
      editable: true,
      lastModified: Date.now(),
    }

    this.files.set(path, file)
    this.updateManifest()
    return true
  }

  /**
   * Read a file's content
   */
  readFile(path: string): string | null {
    const file = this.files.get(path)
    return file?.content ?? null
  }

  /**
   * Update an existing file's content
   */
  updateFile(path: string, content: string): boolean {
    if (!this.files.has(path)) {
      return false
    }

    const file = this.files.get(path)!
    file.content = content
    file.lastModified = Date.now()
    this.updateManifest()
    return true
  }

  /**
   * Delete a file (controlled deletion)
   */
  deleteFile(path: string): boolean {
    if (!this.files.has(path)) {
      return false
    }

    // Prevent deletion of critical files
    if (this.isCriticalFile(path)) {
      return false
    }

    this.files.delete(path)
    this.updateManifest()
    return true
  }

  /**
   * List all files in the project
   */
  listFiles(): GeneratedFile[] {
    return Array.from(this.files.values())
  }

  /**
   * Get the current file manifest
   */
  getManifest(): FileManifest | null {
    return this.manifest
  }

  /**
   * Validate that a file path is safe and within project boundaries
   */
  private validateFilePath(path: string): boolean {
    // Must be a string
    if (typeof path !== 'string' || path.length === 0) {
      return false
    }

    // Normalize path separators
    const normalizedPath = path.replace(/\\/g, '/')

    // Must start with src/ or be in allowed root
    if (
      !normalizedPath.startsWith('src/') &&
      !normalizedPath.startsWith('public/') &&
      !normalizedPath.startsWith('package.json') &&
      !normalizedPath.startsWith('tsconfig.json') &&
      !normalizedPath.startsWith('vite.config') &&
      !normalizedPath.startsWith('README.md') &&
      !normalizedPath.startsWith('index.html')
    ) {
      return false
    }

    // Must not contain path traversal
    if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
      return false
    }

    // Must not exceed reasonable length
    if (normalizedPath.length > 500) {
      return false
    }

    return true
  }

  /**
   * Check if a file is critical and should not be deleted
   */
  private isCriticalFile(path: string): boolean {
    const criticalFiles = [
      'package.json',
      'index.html',
      'tsconfig.json',
      'vite.config.ts',
    ]

    return criticalFiles.includes(path)
  }

  /**
   * Update the manifest with current file state
   */
  private updateManifest(): void {
    if (!this.manifest) {
      return
    }

    this.manifest.files = Array.from(this.files.values())
    this.manifest.updatedAt = Date.now()
  }

  /**
   * Validate dependency against allowlist
   */
  validateDependency(dependency: string): boolean {
    // Normalize the dependency name
    const normalizedDep = dependency.toLowerCase().replace(/[^a-z0-9-]/g, '')

    // Hardcoded essential dependencies (always allowed)
    const essentialDeps = ['react', 'react-dom', 'typescript', 'vite']
    if (essentialDeps.includes(normalizedDep)) {
      return true
    }

    // Check against allowlist
    return this.allowedDependencies.has(normalizedDep)
  }

  /**
   * Set allowed dependencies
   */
  setAllowedDependencies(deps: string[]): void {
    this.allowedDependencies = new Set(deps.map((d) => d.toLowerCase()))
  }

  /**
   * Check if a dependency is in the allowlist
   */
  isDependencyAllowed(dependency: string): boolean {
    return this.validateDependency(dependency)
  }
}
