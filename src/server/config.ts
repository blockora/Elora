import {
  createProvider,
  type ProviderConfig,
  type ProviderType,
} from './providers'

export interface ServerConfig {
  providerType: ProviderType
  geminiApiKey?: string
  geminiModel?: string
  timeoutMs: number
  rateLimit: {
    maxRequests: number
    windowMs: number
  }
}

export function loadServerConfig(): ServerConfig {
  const providerType = (process.env.AI_PROVIDER?.trim() ||
    'mock') as ProviderType

  if (providerType !== 'mock' && providerType !== 'gemini') {
    throw new Error(
      `Invalid AI_PROVIDER: "${providerType}". Must be "mock" or "gemini".`,
    )
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || undefined
  const geminiModel = process.env.GEMINI_MODEL?.trim() || undefined

  // Validate Gemini configuration if requested
  if (providerType === 'gemini' && !geminiApiKey) {
    throw new Error(
      'Gemini provider selected but GEMINI_API_KEY is not configured.',
    )
  }

  return {
    providerType,
    geminiApiKey,
    geminiModel,
    timeoutMs: 30000,
    rateLimit: {
      maxRequests: 30,
      windowMs: 60000,
    },
  }
}

export function createServerProvider(config: ServerConfig) {
  const providerConfig: ProviderConfig = {
    type: config.providerType,
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
  }
  return createProvider(providerConfig)
}
