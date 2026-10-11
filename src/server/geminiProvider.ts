import { GoogleGenAI } from '@google/genai'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { websiteSpecSchema } from '../features/website/schema'

export interface GeminiProviderConfig {
  apiKey: string
  model?: string
}

export class GeminiProvider {
  private ai: GoogleGenAI
  private model: string

  constructor(config: GeminiProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required')
    }
    this.ai = new GoogleGenAI({ apiKey: config.apiKey })
    this.model = config.model || 'gemini-2.5-flash'
  }

  async generateWebsite(input: { prompt: string }): Promise<unknown> {
    const systemInstruction = `You are Elora, an AI website builder that creates structured website specifications.

Your task is to transform user prompts into valid website specifications that follow the exact schema provided below.

Guidelines:
- Create a coherent website name (2-80 characters) based on the user's request
- Write a concise description (1-240 characters) of the website
- Choose an appropriate theme (light or dark mode) with matching colors
- Generate 1-20 relevant sections based on the user's request
- Use only the supported section types: hero, features, about, services, product-grid, pricing, gallery, testimonials, team, faq, contact, cta, footer
- Each section must have a unique id (1-64 characters) and a title (1-120 characters)
- Keep text content realistic and relevant to the user's request
- Ensure all content is appropriate for a public website
- Do not include any executable code, scripts, or external resource references

The user will provide a prompt describing the website they want. Generate a complete specification that matches their request.`

    const userPrompt = `Create a website specification for: ${input.prompt}

Respond with a valid JSON object matching this exact schema:

${JSON.stringify(zodToJsonSchema(websiteSpecSchema as never), null, 2)}`

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: zodToJsonSchema(websiteSpecSchema as never),
      },
    })

    if (!response.text) {
      throw new Error('Gemini returned an empty response')
    }

    return JSON.parse(response.text)
  }

  async editWebsite(input: {
    currentSpec: unknown
    instruction: string
  }): Promise<unknown> {
    const systemInstruction = `You are Elora, an AI website editor that modifies existing website specifications.

Your task is to apply user instructions to modify an existing website specification while preserving its structure and content.

Guidelines:
- Preserve the overall structure and all sections unless explicitly instructed to remove them
- Apply the user's instruction to the relevant sections
- Keep all existing content that is not affected by the instruction
- Maintain valid JSON structure matching the schema
- Do not introduce executable code, scripts, or external resource references
- Generate a brief change summary describing what was modified

The user will provide an instruction describing what they want to change.`

    const userPrompt = `Modify this website specification according to this instruction: "${input.instruction}"

Current specification:
${JSON.stringify(input.currentSpec, null, 2)}

Respond with the complete updated specification as a valid JSON object matching this exact schema:

${JSON.stringify(zodToJsonSchema(websiteSpecSchema as never), null, 2)}

Also include a "changeSummary" field with a brief description of what was changed.`

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            spec: zodToJsonSchema(websiteSpecSchema as never),
            changeSummary: { type: 'STRING' },
          },
          required: ['spec', 'changeSummary'],
        } as never,
      },
    })

    if (!response.text) {
      throw new Error('Gemini returned an empty response')
    }

    const result = JSON.parse(response.text)
    // Return just the spec for compatibility with the API handler
    return result.spec
  }
}
