import { describe, expect, it } from 'vitest'
import {
  MockGitHubClient,
  exportToGitHub,
  classifyGitHubError,
  isValidExportResult,
  ELORA_GITHUB_SCOPES,
  ELORA_GITHUB_CREATE_REPO_SCOPES,
} from '../index'
import type { GitHubAuthToken } from '../types'

function makeToken(overrides?: Partial<GitHubAuthToken>): GitHubAuthToken {
  return {
    token: 'tok-1',
    tokenType: 'token',
    issuedAt: Date.now(),
    ...overrides,
  }
}

describe('GitHub export architecture', () => {
  describe('permission design', () => {
    it('defines the minimal export scope as public_repo', () => {
      expect(ELORA_GITHUB_SCOPES).toEqual(['public_repo'])
    })

    it('defines a broader create-repo scope for repository creation only', () => {
      expect(ELORA_GITHUB_CREATE_REPO_SCOPES).toContain('repo')
      expect(ELORA_GITHUB_CREATE_REPO_SCOPES).not.toEqual(ELORA_GITHUB_SCOPES)
    })
  })

  describe('MockGitHubClient', () => {
    it('builds an authorization URL', () => {
      const client = new MockGitHubClient()
      const url = client.buildAuthorizationUrl('https://elora.test/callback', [
        'public_repo',
      ])
      expect(url).toContain('login/oauth/authorize')
      expect(url).toContain('client_id=mock-client-id')
    })

    it('exchanges a code for a token', async () => {
      const client = new MockGitHubClient()
      const token = await client.exchangeCodeForToken(
        'code',
        'https://elora.test/callback',
      )
      expect(token.token).toContain('mock-token-')
      expect(token.tokenType).toBe('token')
    })

    it('validates a seeded token', async () => {
      const client = new MockGitHubClient()
      const token = makeToken()
      client.seedToken(token)
      const result = await client.validateToken(token.token)
      expect(result.valid).toBe(true)
    })

    it('rejects an unknown token', async () => {
      const client = new MockGitHubClient()
      const result = await client.validateToken('unknown')
      expect(result.valid).toBe(false)
    })

    it('lists user repositories for a valid token', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      client.addRepository({
        owner: 'mock-user',
        name: 'my-site',
        fullName: 'mock-user/my-site',
        private: false,
        htmlUrl: 'https://github.com/mock-user/my-site',
        createdByElora: false,
      })
      const repos = await client.listUserRepositories('tok-1')
      expect(repos).toHaveLength(1)
      expect(repos[0].fullName).toBe('mock-user/my-site')
    })

    it('rejects listing without a token', async () => {
      const client = new MockGitHubClient()
      await expect(client.listUserRepositories('bad')).rejects.toThrow(
        'AUTH_REQUIRED',
      )
    })

    it('creates a repository when authorized', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      const repo = await client.createRepository(
        'tok-1',
        'new-site',
        true,
        'An exported site',
      )
      expect(repo.fullName).toBe('mock-user/new-site')
      expect(repo.createdByElora).toBe(true)
    })

    it('rejects repository creation without a token', async () => {
      const client = new MockGitHubClient()
      await expect(client.createRepository('bad', 'x', true)).rejects.toThrow(
        'AUTH_REQUIRED',
      )
    })

    it('rejects repository creation when the name is already taken', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      client.addRepository({
        owner: 'mock-user',
        name: 'taken',
        fullName: 'mock-user/taken',
        private: false,
        htmlUrl: 'https://github.com/mock-user/taken',
        createdByElora: false,
      })
      const repoErr = await client
        .createRepository('tok-1', 'taken', true)
        .then(() => {
          throw new Error('expected to reject')
        })
        .catch((e: unknown) => e as Error)
      expect(repoErr.message).toContain('REPO_NAME_UNAVAILABLE')
      const body = JSON.parse(repoErr.message) as {
        code: string
        message: string
      }
      expect(body.code).toBe('REPO_NAME_UNAVAILABLE')
      expect(body.message).toContain('already exists')
    })

    it('uploads repository contents when authorized', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      const files = new Map([['index.html', '<h1>hi</h1>']])
      await client.uploadRepositoryContents(
        'tok-1',
        'mock-user',
        'repo',
        files,
        'export',
      )
    })

    it('rejects upload without a token', async () => {
      const client = new MockGitHubClient()
      await expect(
        client.uploadRepositoryContents(
          'bad',
          'o',
          'r',
          new Map([['a', 'b']]),
          'x',
        ),
      ).rejects.toThrow('AUTH_REQUIRED')
    })

    it('rejects upload when there are no files', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      await expect(
        client.uploadRepositoryContents('tok-1', 'o', 'r', new Map(), 'x'),
      ).rejects.toMatchObject({
        message: JSON.stringify({
          code: 'CONTENTS_UPLOAD_FAILED',
        }),
      })
    })

    it('simulates repository creation failure in configured failure mode', async () => {
      const client = new MockGitHubClient()
      client.failureMode = {
        stage: 'create',
        code: 'REPO_CREATION_FAILED',
        message: 'Server error during repository creation.',
      }
      client.seedToken(makeToken())
      await expect(
        client.createRepository('tok-1', 'site', true),
      ).rejects.toThrow('Server error during repository creation.')
    })

    it('simulates upload failure in configured failure mode', async () => {
      const client = new MockGitHubClient()
      client.failureMode = {
        stage: 'upload',
        code: 'CONTENTS_UPLOAD_FAILED',
        message: 'GitHub rejected the file upload.',
      }
      client.seedToken(makeToken())
      await expect(
        client.uploadRepositoryContents(
          'tok-1',
          'o',
          'r',
          new Map([['a', 'b']]),
          'x',
        ),
      ).rejects.toThrow('GitHub rejected the file upload.')
    })
  })

  describe('exportToGitHub orchestration', () => {
    it('requires authorization before export', async () => {
      const client = new MockGitHubClient()
      const result = await exportToGitHub(
        client,
        { kind: 'existing-repo', owner: 'o', repo: 'r' },
        new Map([['index.html', 'x']]),
        undefined,
        'export',
      )
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('rejects an invalid token', async () => {
      const client = new MockGitHubClient()
      const result = await exportToGitHub(
        client,
        { kind: 'existing-repo', owner: 'o', repo: 'r' },
        new Map([['index.html', 'x']]),
        'bad',
        'export',
      )
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_FAILED')
    })

    it('exports to an existing repository', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      const result = await exportToGitHub(
        client,
        { kind: 'existing-repo', owner: 'mock-user', repo: 'my-site' },
        new Map([
          ['index.html', '<h1>hi</h1>'],
          ['README.md', '# site'],
        ]),
        'tok-1',
        'Export a website',
      )
      expect(result.success).toBe(true)
      expect(result.repository?.fullName).toBe('mock-user/my-site')
      expect(result.repositoryUrl).toBe('https://github.com/mock-user/my-site')
    })

    it('creates a repository and exports to it', async () => {
      const client = new MockGitHubClient()
      client.seedToken(makeToken())
      const result = await exportToGitHub(
        client,
        {
          kind: 'create-repo',
          proposedName: 'elora-export',
          description: 'An exported site',
        },
        new Map([['index.html', '<h1>hi</h1>']]),
        'tok-1',
        'Export a website',
      )
      expect(result.success).toBe(true)
      expect(result.repository?.name).toBe('elora-export')
      expect(result.repository?.createdByElora).toBe(true)
      expect(result.repositoryUrl).toBe(
        'https://github.com/mock-user/elora-export',
      )
    })

    it('fails cleanly when repository creation fails', async () => {
      const client = new MockGitHubClient()
      client.failureMode = {
        stage: 'create',
        code: 'REPO_CREATION_FAILED',
        message: 'Could not create the repository.',
      }
      client.seedToken(makeToken())
      const result = await exportToGitHub(
        client,
        { kind: 'create-repo', proposedName: 'site' },
        new Map([['index.html', 'x']]),
        'tok-1',
        'export',
      )
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('REPO_CREATION_FAILED')
    })

    it('fails cleanly when upload fails', async () => {
      const client = new MockGitHubClient()
      client.failureMode = {
        stage: 'upload',
        code: 'CONTENTS_UPLOAD_FAILED',
        message: 'GitHub rejected the upload.',
      }
      client.seedToken(makeToken())
      const result = await exportToGitHub(
        client,
        { kind: 'existing-repo', owner: 'mock-user', repo: 'site' },
        new Map([['index.html', 'x']]),
        'tok-1',
        'export',
      )
      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CONTENTS_UPLOAD_FAILED')
    })
  })

  describe('error classification', () => {
    it('classifies known error codes', () => {
      expect(
        classifyGitHubError({
          code: 'RATE_LIMITED',
          message: 'rate limit exceeded',
        }),
      ).toEqual({
        code: 'RATE_LIMITED',
        message: 'GitHub rate limits were exceeded. Please wait and try again.',
      })
      expect(
        classifyGitHubError({ code: 'AUTH_REQUIRED', message: 'x' }),
      ).toEqual({
        code: 'AUTH_REQUIRED',
        message: 'Please authorize Elora to export to GitHub.',
      })
      expect(
        classifyGitHubError({ code: 'REPO_NOT_FOUND', message: 'x' }),
      ).toEqual({
        code: 'REPO_NOT_FOUND',
        message: 'The selected repository was not found.',
      })
    })

    it('falls back to UNKNOWN_ERROR for unrecognized payloads', () => {
      expect(classifyGitHubError({ code: 'COMPLICATED' })).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'The repository export did not return a recognizable result.',
      })
    })

    it('handles null and unknown inputs', () => {
      expect(classifyGitHubError(null)).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'The repository export did not return a recognizable result.',
      })
      expect(classifyGitHubError('plain text')).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'The repository export did not return a recognizable result.',
      })
    })

    it('recognizes rate-limit text even without a structured code', () => {
      expect(
        classifyGitHubError({
          message: 'API rate limit exceeded for this user',
        }),
      ).toEqual({
        code: 'RATE_LIMITED',
        message: 'GitHub rate limits were exceeded. Please wait and try again.',
      })
    })
  })

  describe('result validation', () => {
    it('accepts a well-formed success result', () => {
      expect(
        isValidExportResult({
          success: true,
          repository: {
            owner: 'o',
            name: 'n',
            fullName: 'o/n',
            private: false,
            htmlUrl: 'https://github.com/o/n',
            createdByElora: false,
          },
          repositoryUrl: 'https://github.com/o/n',
        }),
      ).toBe(true)
    })

    it('rejects success results missing required fields', () => {
      expect(isValidExportResult({ success: true })).toBe(false)
      expect(
        isValidExportResult({ success: true, repositoryUrl: 'https://x' }),
      ).toBe(false)
    })

    it('accepts a well-formed failure result', () => {
      expect(
        isValidExportResult({
          success: false,
          error: { code: 'AUTH_REQUIRED', message: 'Please authorize.' },
        }),
      ).toBe(true)
    })

    it('rejects failure results missing an error', () => {
      expect(isValidExportResult({ success: false })).toBe(false)
    })
  })
})
