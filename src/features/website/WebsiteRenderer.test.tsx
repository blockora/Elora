import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseWebsiteSpec, type WebsiteSpec } from './schema'
import { WebsiteRenderer } from './WebsiteRenderer'

function specWithSections(sections: WebsiteSpec['sections']): WebsiteSpec {
  return parseWebsiteSpec({
    name: 'Test Studio',
    description: 'A renderer fixture',
    theme: {
      mode: 'light',
      primaryColor: '#345678',
      backgroundColor: '#FFFFFF',
      textColor: '#111111',
    },
    sections,
  })
}

describe('WebsiteRenderer', () => {
  it('renders all supported sections from text content with theme tokens', () => {
    const spec = specWithSections([
      {
        id: 'hero',
        type: 'hero',
        title: 'Welcome <script>alert(1)</script>',
        subtitle: 'A safe subtitle',
        ctaLabel: 'Visit',
      },
      {
        id: 'features',
        type: 'features',
        title: 'Features',
        items: [{ title: 'Fresh', description: 'Locally made' }],
      },
      { id: 'about', type: 'about', title: 'About', body: 'About this place' },
      {
        id: 'services',
        type: 'services',
        title: 'Services',
        items: [{ name: 'Design', description: 'Thoughtful work' }],
      },
      {
        id: 'products',
        type: 'product-grid',
        title: 'Products',
        items: [{ name: 'Tea', description: 'Loose leaf', price: '$8' }],
      },
      {
        id: 'pricing',
        type: 'pricing',
        title: 'Plans',
        plans: [{ name: 'Basic', price: 'Free' }],
      },
      {
        id: 'gallery',
        type: 'gallery',
        title: 'Gallery',
        captions: ['The garden'],
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        title: 'Kind words',
        quotes: [{ quote: 'Lovely.', author: 'Sam' }],
      },
      {
        id: 'team',
        type: 'team',
        title: 'Team',
        members: [{ name: 'Alex', role: 'Maker' }],
      },
      {
        id: 'faq',
        type: 'faq',
        title: 'Questions',
        items: [{ question: 'When?', answer: 'Soon.' }],
      },
      {
        id: 'contact',
        type: 'contact',
        title: 'Contact',
        email: 'hello@example.com',
        phone: '+1 555 0100',
        address: '12 Main St',
      },
      {
        id: 'cta',
        type: 'cta',
        title: 'Join us',
        body: 'Come by today.',
        ctaLabel: 'Get started',
      },
      { id: 'footer', type: 'footer', title: 'Test Studio' },
    ])

    const markup = renderToStaticMarkup(<WebsiteRenderer spec={spec} />)
    expect(markup).toContain('class="generated-site generated-site--light"')
    expect(markup).toContain('--site-primary:#345678')
    expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(markup).not.toContain('<script>alert(1)</script>')
    for (const title of [
      'Features',
      'About',
      'Services',
      'Products',
      'Plans',
      'Gallery',
      'Kind words',
      'Team',
      'Questions',
      'Contact',
      'Join us',
      'Test Studio',
    ]) {
      expect(markup).toContain(title)
    }
  })

  it('renders useful fallback content when optional section data is absent', () => {
    const spec = specWithSections([
      { id: 'features', type: 'features', title: 'Features' },
      { id: 'about', type: 'about', title: 'About' },
      { id: 'services', type: 'services', title: 'Services' },
      { id: 'products', type: 'product-grid', title: 'Products' },
      { id: 'pricing', type: 'pricing', title: 'Pricing' },
      { id: 'gallery', type: 'gallery', title: 'Gallery' },
      { id: 'testimonials', type: 'testimonials', title: 'Testimonials' },
      { id: 'team', type: 'team', title: 'Team' },
      { id: 'faq', type: 'faq', title: 'FAQ' },
      { id: 'contact', type: 'contact', title: 'Contact' },
    ])
    const markup = renderToStaticMarkup(<WebsiteRenderer spec={spec} />)
    expect(markup).toContain('Add details to introduce your features.')
    expect(markup).toContain(
      'A little more about what makes this place special.',
    )
    expect(markup).toContain('Contact details will appear here.')
  })
})
