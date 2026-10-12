/**
 * GitHub integration abstractions for Phase 9
 *
 * This module provides the repository-side GitHub abstraction Elora uses for
 * export workflows. The real GitHub API is behind interfaces so the code can
 * be tested deterministically and wired to a live integration when credentials
 * are available.
 *
 * The browser never receives a GitHub token. All token handling is server-side.
 */

import type {
  GitHubEnvironment,
  GitHubAuthToken,
  GitHubRepoPermissionScope,
  GitHubRepo,
  GitHubExportMode,
  GitHubExportResult,
  GitHubExportErrorCode,
} from './types'
export type {
  GitHubEnvironment,
  GitHubAuthToken,
  GitHubRepoPermissionScope,
  GitHubRepo,
  GitHubExportMode,
  GitHubExportResult,
  GitHubExportErrorCode,
}
export {
  ELORA_GITHUB_SCOPES,
  ELORA_GITHUB_CREATE_REPO_SCOPES,
  classifyGitHubError,
  isValidExportResult,
} from './types'

export interface GitHubClient {
  /**
   * Build the authorization URL a user should be redirected to in order to
   * explicitly authorize Elora.
   */
  buildAuthorizationUrl(
    redirectUri: string,
    scopes: string[],
    state?: string,
  ): string

  /**
   * Exchange an authorization code for a token.
   */
  exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<GitHubAuthToken>

  /**
   * Validate an existing token (for example, before an export).
   */
  validateToken(token: string): Promise<{ valid: boolean; error?: string }>

  /**
   * List repositories the user can export to.
   *
   * This is used ONLY to let the user choose an existing repository they own.
   * It is NOT used to enumerate repositories for any other purpose.
   */
  listUserRepositories(
    token: string,
    visibility?: 'all' | 'owner' | 'public' | 'private',
  ): Promise<GitHubRepo[]>

  /**
   * Create a new repository for the user.
   *
   * This is called ONLY when the user explicitly chooses to create a new
   * repository, and ONLY with the create-repo permission scope.
   */
  createRepository(
    token: string,
    name: string,
    private_: boolean,
    _description?: string,
  ): Promise<GitHubRepo>

  /**
   * Upload website files to a repository.
   *
   * The caller is responsible for converting the project into the files to
   * upload. This method only handles the GitHub API interaction.
   */
  uploadRepositoryContents(
    token: string,
    _owner: string,
    _repo: string,
    files: ReadonlyMap<string, string>,
    _message: string,
  ): Promise<void>
}

/**
 * A deterministic, in-memory mock GitHub client for development and testing.
 *
 * It does NOT call GitHub. It simulates the export workflow so the
 * repository-side code and error handling can be tested without external
 * credentials.
 */
export class MockGitHubClient implements GitHubClient {
  private tokens = new Map<string, GitHubAuthToken>()
  private repositories = new Map<string, GitHubRepo>()
  /**
   * Configured failure mode, used to simulate repository creation failures
   * and other error scenarios in tests.
   */
  failureMode: null | {
    stage: 'authorize' | 'token' | 'validate' | 'list' | 'create' | 'upload'
    code: GitHubExportErrorCode
    message: string
  } = null

  constructor(
    private env: GitHubEnvironment = {
      apiBaseUrl: 'https://api.github.com',
      clientId: 'mock-client-id',
    },
  ) {}

  buildAuthorizationUrl(
    _redirectUri: string,
    _scopes: string[],
    _state?: string,
  ): string {
    if (this.failureMode?.stage === 'authorize') {
      throw new Error(
        `GitHub authorization is unavailable: ${this.failureMode.message}`,
      )
    }
    return `${this.env.apiBaseUrl}/login/oauth/authorize?client_id=${this.env.clientId}&redirect_uri=${encodeURIComponent('/mock-callback')}`
  }

  async exchangeCodeForToken(
    _code: string,
    _redirectUri: string,
  ): Promise<GitHubAuthToken> {
    if (this.failureMode?.stage === 'token') {
      throw new Error(this.failureMode.message)
    }
    const token: GitHubAuthToken = {
      token: `mock-token-${Date.now()}`,
      tokenType: 'token',
      issuedAt: Date.now(),
    }
    this.tokens.set(token.token, token)
    return token
  }

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; error?: string }> {
    if (this.failureMode?.stage === 'validate') {
      return { valid: false, error: this.failureMode.message }
    }
    if (!this.tokens.has(token)) {
      return { valid: false, error: 'Token is not recognized.' }
    }
    return { valid: true }
  }

  async listUserRepositories(
    token: string,
    visibility: 'all' | 'owner' | 'public' | 'private' = 'owner',
  ): Promise<GitHubRepo[]> {
    if (this.failureMode?.stage === 'list') {
      throw new Error(this.failureMode.message)
    }
    if (!this.tokens.has(token)) {
      throw new Error('AUTH_REQUIRED')
    }
    const repos: GitHubRepo[] = []
    for (const [, repo] of this.repositories) {
      if (visibility === 'owner' && repo.owner !== 'mock-user') {
        continue
      }
      repos.push(repo)
    }
    return repos
  }

  async createRepository(
    token: string,
    name: string,
    private_: boolean,
    _description?: string,
  ): Promise<GitHubRepo> {
    if (this.failureMode?.stage === 'create') {
      const code =
        this.failureMode.code === 'REPO_NAME_UNAVAILABLE'
          ? 'REPO_NAME_UNAVAILABLE'
          : 'REPO_CREATION_FAILED'
      throw new Error(
        JSON.stringify({
          code,
          message: this.failureMode.message,
        }),
      )
    }
    if (!this.tokens.has(token)) {
      throw new Error('AUTH_REQUIRED')
    }
    const fullName = `mock-user/${name}`
    if (this.repositories.has(fullName)) {
      throw new Error(
        JSON.stringify({
          code: 'REPO_NAME_UNAVAILABLE',
          message: `A repository named "${name}" already exists.`,
        }),
      )
    }
    const repo: GitHubRepo = {
      owner: 'mock-user',
      name,
      fullName,
      private: private_,
      htmlUrl: `https://github.com/mock-user/${name}`,
      createdByElora: true,
    }
    this.repositories.set(name, repo)
    return repo
  }

  async uploadRepositoryContents(
    token: string,
    _owner: string,
    _repo: string,
    files: ReadonlyMap<string, string>,
    _message: string,
  ): Promise<void> {
    if (this.failureMode?.stage === 'upload') {
      throw new Error(
        JSON.stringify({
          code: 'CONTENTS_UPLOAD_FAILED',
          message: this.failureMode.message,
        }),
      )
    }
    if (!this.tokens.has(token)) {
      throw new Error('AUTH_REQUIRED')
    }
    if (files.size === 0) {
      throw new Error(
        JSON.stringify({
          code: 'CONTENTS_UPLOAD_FAILED',
        }),
      )
    }
    // In the mock, "upload" simply records that files were accepted.
    // Real implementation would call the GitHub Contents API.
    return
  }

  /**
   * Seed the mock with a repository the user can choose in export flows.
   */
  addRepository(repo: GitHubRepo): void {
    this.repositories.set(repo.fullName, repo)
  }

  /**
   * Seed the mock with an authorized token.
   */
  seedToken(token: GitHubAuthToken): void {
    this.tokens.set(token.token, token)
  }
}

/**
 * Orchestrate a GitHub export workflow.
 *
 * This is the repository-side entry point for exporting a website to GitHub.
 * It coordinates authorization, repository selection/creation, and file upload.
 *
 * It returns a GitHubExportResult with a stable error code so the frontend and
 * tests can react deterministically.
 */
export async function exportToGitHub(
  client: GitHubClient,
  mode: GitHubExportMode,
  files: ReadonlyMap<string, string>,
  token: string | undefined,
  changeSummary: string,
): Promise<GitHubExportResult> {
  // 1. Authorization is required up front.
  if (!token) {
    return {
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Please authorize Elora to export to GitHub.',
      },
    }
  }

  // 2. Validate the token before attempting anything.
  const validation = await client.validateToken(token)
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: validation.error || 'GitHub authorization is no longer valid.',
      },
    }
  }

  // 3. Determine the target repository.
  let repo: GitHubRepo | undefined
  let repositoryUrl: string | undefined

  if (mode.kind === 'existing-repo') {
    // Use the repository the user selected.
    repo = {
      owner: mode.owner,
      name: mode.repo,
      fullName: `${mode.owner}/${mode.repo}`,
      private: false,
      htmlUrl: `https://github.com/${mode.owner}/${mode.repo}`,
      createdByElora: false,
    }
    repositoryUrl = repo.htmlUrl
  } else {
    // Create a new repository.
    try {
      repo = await client.createRepository(
        token,
        mode.proposedName,
        true,
        mode.description,
      )
      repositoryUrl = repo.htmlUrl
    } catch (error) {
      const payload =
        error instanceof Error ? safeParseGitHubError(error.message) : null
      return {
        success: false,
        error: payload
          ? {
              code: payload.code,
              message: payload.message,
            }
          : {
              code: 'REPO_CREATION_FAILED',
              message: 'Could not create the repository. Please try again.',
            },
      }
    }
  }

  if (!repo) {
    return {
      success: false,
      error: {
        code: 'REPO_NOT_FOUND',
        message: 'The target repository was not found.',
      },
    }
  }

  // 4. Upload the website files.
  try {
    await client.uploadRepositoryContents(
      token,
      repo.owner,
      repo.name,
      files,
      changeSummary,
    )
  } catch (error) {
    const payload =
      error instanceof Error ? safeParseGitHubError(error.message) : null
    return {
      success: false,
      error: payload
        ? { code: payload.code, message: payload.message }
        : {
            code: 'CONTENTS_UPLOAD_FAILED',
            message: 'Could not upload the website files to the repository.',
          },
    }
  }

  return {
    success: true,
    repository: repo && {
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      private: repo.private,
      htmlUrl: repo.htmlUrl,
      createdByElora: repo.createdByElora,
    },
    repositoryUrl,
  }
}

/**
 * Safely parse a GitHub error thrown by the client into an export error payload.
 */
function safeParseGitHubError(
  message: string,
): { code: GitHubExportErrorCode; message: string } | null {
  try {
    const parsed = JSON.parse(message)
    if (
      parsed &&
      typeof parsed.code === 'string' &&
      typeof parsed.message === 'string'
    ) {
      return {
        code: parsed.code as GitHubExportErrorCode,
        message: parsed.message,
      }
    }
  } catch {
    // Not a JSON error payload; fall through.
  }

  const lower = message.toLowerCase()
  if (lower.includes('rate limit')) {
    return { code: 'RATE_LIMITED', message: message }
  }
  if (lower.includes('token expired')) {
    return { code: 'TOKEN_EXPIRED', message: message }
  }
  if (lower.includes('not found')) {
    return { code: 'REPO_NOT_FOUND', message: message }
  }
  if (lower.includes('permission') || lower.includes('denied')) {
    return { code: 'REPO_PERMISSION_DENIED', message: message }
  }
  if (lower.includes('unavailable') || lower.includes('already exists')) {
    return { code: 'REPO_NAME_UNAVAILABLE', message: message }
  }
  return { code: 'UNKNOWN_ERROR', message: message }
}
