import { MockAIProvider } from './api'
import { GeminiProvider } from './geminiProvider'

export type ProviderType = 'mock' | 'gemini'

export interface ProviderConfig {
  type: ProviderType
  apiKey?: string
  model?: string
}

export function createProvider(
  config: ProviderConfig,
): MockAIProvider | GeminiProvider {
  switch (config.type) {
    case 'gemini':
      if (!config.apiKey) {
        throw new Error('Gemini API key is required for Gemini provider')
      }
      return new GeminiProvider({
        apiKey: config.apiKey,
        model: config.model,
      })
    case 'mock':
    default:
      return new MockAIProvider()
  }
}
