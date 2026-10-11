import { describe, expect, it } from 'vitest'
import { restaurantWebsite } from './examples'
import { parseWebsiteSpec, websiteSpecSchema } from './schema'

describe('WebsiteSpec schema', () => {
  it('accepts the validated restaurant example and supported section variants', () => {
    expect(parseWebsiteSpec(restaurantWebsite)).toEqual(restaurantWebsite)
    expect(restaurantWebsite.sections.map((section) => section.type)).toEqual([
      'hero',
      'features',
      'contact',
      'footer',
    ])
  })

  it('rejects missing top-level fields, invalid themes, and unknown section types', () => {
    const base = {
      name: 'Test',
      description: 'Test site',
      theme: {
        mode: 'light',
        primaryColor: '#123456',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      },
      sections: [{ id: 'hero', type: 'hero', title: 'Welcome' }],
    }

    expect(
      websiteSpecSchema.safeParse({
        ...base,
        theme: { ...base.theme, mode: 'sepia' },
      }).success,
    ).toBe(false)
    expect(
      websiteSpecSchema.safeParse({
        ...base,
        theme: { ...base.theme, primaryColor: 'red' },
      }).success,
    ).toBe(false)
    expect(
      websiteSpecSchema.safeParse({
        ...base,
        sections: [{ id: 'other', type: 'custom', title: 'Unsafe' }],
      }).success,
    ).toBe(false)
    expect(
      websiteSpecSchema.safeParse({ ...base, unexpected: '<script />' })
        .success,
    ).toBe(false)
  })

  it('bounds text and collection sizes', () => {
    expect(
      websiteSpecSchema.safeParse({
        ...restaurantWebsite,
        sections: Array.from({ length: 21 }, (_, index) => ({
          id: `s${index}`,
          type: 'footer',
          title: 'Footer',
        })),
      }).success,
    ).toBe(false)
    expect(
      websiteSpecSchema.safeParse({
        ...restaurantWebsite,
        name: 'x'.repeat(81),
      }).success,
    ).toBe(false)
  })

  it('reports parse errors instead of accepting untrusted values', () => {
    expect(() => parseWebsiteSpec(null)).toThrow()
    expect(() => parseWebsiteSpec({})).toThrow()
  })
})
