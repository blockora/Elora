/**
 * GitHub integration types and permission design for Phase 9
 *
 * This module defines the GitHub integration architecture Elora uses to let
 * users export generated websites to their own GitHub repositories.
 *
 * Design principles:
 * - Users must explicitly authorize repository access. There is no silent or
 *   implicit repository creation.
 * - Only the minimum permissions required for export are requested.
 * - Repository creation/export failures are surfaced clearly and do not block
 *   other Elora functionality (ZIP download still works).
 * - All GitHub credentials stay server-side; the browser never receives a
 *   GitHub token.
 *
 * Permission scope (least-privilege):
 * - repo scope is required only when creating a new repository on the user's
 *   behalf.
 * - For exporting to an existing repository the user owns, a narrower token
 *   with contents:write may be sufficient.
 * - Elora never requests admin, organization management, or other unnecessary
 *   scopes.
 *
 * Authorization model:
 * - GitHub OAuth/app installation with an explicit authorization step.
 * - The user completes authorization on GitHub's domain.
 * - Elora receives a token/backlink and stores it server-side, scoped to the
 *   user and project where applicable.
 * - Token lifetime and refresh behavior follow GitHub's OAuth token model.
 *
 * The actual GitHub API calls are abstracted behind interfaces so the
 * repository-side code can be tested with deterministic mocks and so the
 * live GitHub integration can be wired in when credentials are available.
 */

export type GitHubEnvironment = {
  /** Base URL for the GitHub REST API. */
  apiBaseUrl: string
  /** OAuth/app client identifier. */
  clientId: string
  /** OAuth/app client secret (SERVER-SIDE ONLY; never exposed to the browser). */
  clientSecret?: string
  /** Optional installation token for GitHub App installations. */
  installationToken?: string
}

export type GitHubAuthToken = {
  /** Access token used for GitHub API calls. */
  token: string
  /** Token type (typically "Bearer" or "token"). */
  tokenType: string
  /** When the token was issued, in milliseconds since epoch. */
  issuedAt: number
  /** Optional refresh token for re-authorization. */
  refreshToken?: string
}

export type GitHubRepoPermissionScope =
  'public_repo' | 'repo' | 'workflow' | 'write_contents'

/**
 * The minimal permission set Elora requests for exporting a website to a
 * user-owned repository.
 */
export const ELORA_GITHUB_SCOPES: GitHubRepoPermissionScope[] = ['public_repo']

/**
 * Extended permission set used only when Elora may need to create a new
 * repository on the user's behalf.
 *
 * This is intentionally larger than the export-only scope and is requested
 * only when the user explicitly chooses to create a new repository.
 */
export const ELORA_GITHUB_CREATE_REPO_SCOPES: GitHubRepoPermissionScope[] = [
  'repo',
]

export interface GitHubRepo {
  owner: string
  name: string
  fullName: string
  private: boolean
  htmlUrl: string
  /**
   * Whether the repository was created by Elora during the current export
   * workflow. Used for cleanup/rollback documentation.
   */
  createdByElora: boolean
}

export type GitHubExportMode =
  | { kind: 'existing-repo'; owner: string; repo: string }
  | { kind: 'create-repo'; proposedName: string; description?: string }

export interface GitHubExportResult {
  success: boolean
  repository?: GitHubRepo
  /**
   * URL the user can visit to view the exported repository.
   */
  repositoryUrl?: string
  /**
   * For failures, a stable machine-readable code plus a human message.
   */
  error?: {
    code: GitHubExportErrorCode
    message: string
  }
}

export type GitHubExportErrorCode =
  | 'AUTH_NOT_CONFIGURED'
  | 'AUTH_REQUIRED'
  | 'AUTH_FAILED'
  | 'TOKEN_EXPIRED'
  | 'REPO_NOT_FOUND'
  | 'REPO_CREATION_FAILED'
  | 'REPO_PERMISSION_DENIED'
  | 'CONTENTS_UPLOAD_FAILED'
  | 'REPO_NAME_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR'

/**
 * Deterministic error mapping so repository failures are user-friendly and
 * testable without relying on live GitHub error shapes.
 */
export function classifyGitHubError(raw: unknown): {
  code: GitHubExportErrorCode
  message: string
} {
  if (!raw || typeof raw !== 'object') {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'The repository export did not return a recognizable result.',
    }
  }

  const candidate = raw as Record<string, unknown>

  if (
    candidate.code === 'RATE_LIMITED' ||
    /rate limit/i.test(String(candidate.message))
  ) {
    return {
      code: 'RATE_LIMITED',
      message: 'GitHub rate limits were exceeded. Please wait and try again.',
    }
  }

  if (
    candidate.code === 'TOKEN_EXPIRED' ||
    candidate.message === 'token expired'
  ) {
    return {
      code: 'TOKEN_EXPIRED',
      message:
        'The GitHub authorization expired. Please authorize Elora again.',
    }
  }

  if (candidate.code === 'AUTH_NOT_CONFIGURED') {
    return {
      code: 'AUTH_NOT_CONFIGURED',
      message: 'GitHub integration is not configured on the server yet.',
    }
  }

  if (candidate.code === 'AUTH_REQUIRED') {
    return {
      code: 'AUTH_REQUIRED',
      message: 'Please authorize Elora to export to GitHub.',
    }
  }

  if (candidate.code === 'AUTH_FAILED') {
    return {
      code: 'AUTH_FAILED',
      message: 'GitHub authorization failed. Please try again.',
    }
  }

  if (candidate.code === 'REPO_NOT_FOUND') {
    return {
      code: 'REPO_NOT_FOUND',
      message: 'The selected repository was not found.',
    }
  }

  if (candidate.code === 'REPO_PERMISSION_DENIED') {
    return {
      code: 'REPO_PERMISSION_DENIED',
      message: 'Elora does not have permission to write to that repository.',
    }
  }

  if (
    candidate.code === 'REPO_CREATION_FAILED' ||
    candidate.code === 'REPO_NAME_UNAVAILABLE'
  ) {
    return {
      code: 'REPO_CREATION_FAILED',
      message:
        (candidate.message as string) ||
        'Could not create the repository. Please choose a different name or export to an existing repository.',
    }
  }

  if (candidate.code === 'CONTENTS_UPLOAD_FAILED') {
    return {
      code: 'CONTENTS_UPLOAD_FAILED',
      message:
        'The repository was found, but Elora could not upload the website files.',
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message:
      (candidate.message as string) ||
      'The repository export did not return a recognizable result.',
  }
}

/**
 * Lightweight validation for a GitHub export result.
 */
export function isValidExportResult(
  result: unknown,
): result is GitHubExportResult {
  if (!result || typeof result !== 'object') {
    return false
  }
  const candidate = result as unknown as GitHubExportResult
  if (typeof candidate.success !== 'boolean') {
    return false
  }
  if (
    candidate.success &&
    (!candidate.repository || !candidate.repositoryUrl)
  ) {
    return false
  }
  if (!candidate.success && !candidate.error) {
    return false
  }
  return true
}
