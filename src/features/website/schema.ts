import { z } from 'zod'

const hexColorSchema = z.string().regex(/^#[\da-fA-F]{6}$/, {
  message: 'Expected a six-digit hexadecimal color.',
})

export const websiteThemeSchema = z.object({
  mode: z.enum(['light', 'dark']),
  primaryColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  textColor: hexColorSchema,
})

const sectionBase = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
})

export const websiteSectionSchema = z.discriminatedUnion('type', [
  sectionBase.extend({
    type: z.literal('hero'),
    subtitle: z.string().max(240).optional(),
    ctaLabel: z.string().max(48).optional(),
  }),
  sectionBase.extend({
    type: z.literal('features'),
    items: z
      .array(
        z.object({
          title: z.string().min(1).max(80),
          description: z.string().max(240),
        }),
      )
      .max(8)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('about'),
    body: z.string().max(1200).optional(),
  }),
  sectionBase.extend({
    type: z.literal('services'),
    items: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          description: z.string().max(240),
        }),
      )
      .max(8)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('product-grid'),
    items: z
      .array(
        z.object({
          name: z.string().min(1).max(100),
          description: z.string().max(240).optional(),
          price: z.string().max(32).optional(),
        }),
      )
      .max(12)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('pricing'),
    plans: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          price: z.string().min(1).max(32),
          description: z.string().max(240).optional(),
        }),
      )
      .max(6)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('gallery'),
    captions: z.array(z.string().max(100)).max(12).optional(),
  }),
  sectionBase.extend({
    type: z.literal('testimonials'),
    quotes: z
      .array(
        z.object({
          quote: z.string().min(1).max(500),
          author: z.string().min(1).max(80),
        }),
      )
      .max(8)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('team'),
    members: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          role: z.string().max(80).optional(),
        }),
      )
      .max(12)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('faq'),
    items: z
      .array(
        z.object({
          question: z.string().min(1).max(180),
          answer: z.string().min(1).max(600),
        }),
      )
      .max(12)
      .optional(),
  }),
  sectionBase.extend({
    type: z.literal('contact'),
    email: z.string().email().max(254).optional(),
    phone: z.string().max(32).optional(),
    address: z.string().max(240).optional(),
  }),
  sectionBase.extend({
    type: z.literal('cta'),
    body: z.string().max(240).optional(),
    ctaLabel: z.string().max(48).optional(),
  }),
  sectionBase.extend({ type: z.literal('footer') }),
])

export const websiteSpecSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(240),
    theme: websiteThemeSchema,
    sections: z.array(websiteSectionSchema).min(1).max(20),
  })
  .strict()

export type WebsiteTheme = z.infer<typeof websiteThemeSchema>
export type WebsiteSection = z.infer<typeof websiteSectionSchema>
export type WebsiteSpec = z.infer<typeof websiteSpecSchema>

export function parseWebsiteSpec(input: unknown): WebsiteSpec {
  return websiteSpecSchema.parse(input)
}
