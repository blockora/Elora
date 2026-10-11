export const sectionsDir = {
  HeroSection: `import type { WebsiteSection } from '../../types'

interface HeroSectionProps {
  section: WebsiteSection
}

export function HeroSection({ section }: HeroSectionProps) {
  const { title, subtitle, ctaLabel } = section

  return (
    <section style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 700,
          marginBottom: '16px',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '32px',
            opacity: 0.9,
          }}>
            {subtitle}
          </p>
        )}
        {ctaLabel && (
          <button style={{
            backgroundColor: 'var(--primary-color, #d99b72)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  )
}
`,
  FeaturesSection: `import type { WebsiteSection } from '../../types'

interface FeaturesSectionProps {
  section: WebsiteSection
}

export function FeaturesSection({ section }: FeaturesSectionProps) {
  const { title, items = [] } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  AboutSection: `import type { WebsiteSection } from '../../types'

interface AboutSectionProps {
  section: WebsiteSection
}

export function AboutSection({ section }: AboutSectionProps) {
  const { title, body } = section

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>
          {title}
        </h2>
        {body && (
          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.8,
            color: '#555',
          }}>
            {body}
          </p>
        )}
      </div>
    </section>
  )
}
`,
  ServicesSection: `import type { WebsiteSection } from '../../types'

interface ServicesSectionProps {
  section: WebsiteSection
}

export function ServicesSection({ section }: ServicesSectionProps) {
  const { title, items = [] } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
                {item.name}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  ProductGridSection: `import type { WebsiteSection } from '../../types'

interface ProductGridSectionProps {
  section: WebsiteSection
}

export function ProductGridSection({ section }: ProductGridSectionProps) {
  const { title, items = [] } = section

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
                {item.name}
              </h3>
              {item.description && (
                <p style={{ color: '#666', marginBottom: '16px', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              )}
              {item.price && (
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--primary-color, #d99b72)',
                }}>
                  {item.price}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  PricingSection: `import type { WebsiteSection } from '../../types'

interface PricingSectionProps {
  section: WebsiteSection
}

export function PricingSection({ section }: PricingSectionProps) {
  const { title, plans = [] } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                padding: '32px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid transparent',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
                {plan.name}
              </h3>
              {plan.description && (
                <p style={{ color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
                  {plan.description}
                </p>
              )}
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--primary-color, #d99b72)',
                marginBottom: '24px',
              }}>
                {plan.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  GallerySection: `import type { WebsiteSection } from '../../types'

interface GallerySectionProps {
  section: WebsiteSection
}

export function GallerySection({ section }: GallerySectionProps) {
  const { title, captions = [] } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {captions.map((caption, index) => (
            <div
              key={index}
              style={{
                aspectRatio: '4/3',
                backgroundColor: '#ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontStyle: 'italic',
                overflow: 'hidden',
              }}
            >
              {caption || 'Image placeholder'}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  TestimonialsSection: `import type { WebsiteSection } from '../../types'

interface TestimonialsSectionProps {
  section: WebsiteSection
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const { title, quotes = [] } = section

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {quotes.map((quote, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid var(--primary-color, #d99b72)',
              }}
            >
              <p style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: '#555',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}>
                "{quote.quote}"
              </p>
              <p style={{ fontWeight: 600 }}>— {quote.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  TeamSection: `import type { WebsiteSection } from '../../types'

interface TeamSectionProps {
  section: WebsiteSection
}

export function TeamSection({ section }: TeamSectionProps) {
  const { title, members = [] } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
        }}>
          {members.map((member, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color, #d99b72)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.5rem',
              }}>
                {member.name.charAt(0)}
              </div>
              <h3 style={{ fontWeight: 600 }}>{member.name}</h3>
              {member.role && (
                <p style={{ color: '#666' }}>{member.role}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`,
  FAQSection: `import type { WebsiteSection } from '../../types'
import { useState } from 'react'

interface FAQSectionProps {
  section: WebsiteSection
}

export function FAQSection({ section }: FAQSectionProps) {
  const { title, items = [] } = section

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item, index) => {
            const [isOpen, setIsOpen] = useState(false)
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {item.question}
                  <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
                    <p style={{ color: '#555', lineHeight: 1.6 }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
`,
  ContactSection: `import type { WebsiteSection } from '../../types'

interface ContactSectionProps {
  section: WebsiteSection
}

export function ContactSection({ section }: ContactSectionProps) {
  const { title, email, phone, address } = section

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px' }}>
          {title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {email && (
            <a
              href={'mailto:' + email}
              style={{
                color: 'var(--primary-color, #d99b72)',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              {email}
            </a>
          )}
          {phone && (
            <a
              href={'tel:' + phone}
              style={{
                color: 'var(--primary-color, #d99b72)',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              {phone}
            </a>
          )}
          {address && (
            <p style={{ color: '#555', lineHeight: 1.6 }}>
              {address}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
`,
  CTASection: `import type { WebsiteSection } from '../../types'

interface CTASectionProps {
  section: WebsiteSection
}

export function CTASection({ section }: CTASectionProps) {
  const { title, body, ctaLabel } = section

  return (
    <section style={{
      padding: '80px 0',
      backgroundColor: 'var(--primary-color, #d99b72)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        {title && (
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '16px',
            color: 'white',
          }}>
            {title}
          </h2>
        )}
        {body && (
          <p style={{
            fontSize: '1.125rem',
            marginBottom: '32px',
            color: 'rgba(255,255,255,0.9)',
          }}>
            {body}
          </p>
        )}
        {ctaLabel && (
          <button style={{
            backgroundColor: 'white',
            color: 'var(--primary-color, #d99b72)',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  )
}
`,
  FooterSection: `import type { WebsiteSection } from '../../types'

interface FooterSectionProps {
  section: WebsiteSection
}

export function FooterSection({ section }: FooterSectionProps) {
  const { title } = section

  return (
    <footer style={{
      padding: '48px 0',
      backgroundColor: '#333',
      color: 'white',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {title && (
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>
            {title}
          </h3>
        )}
        <p style={{ color: '#aaa', fontSize: '0.875rem' }}>
          Generated with Elora
        </p>
      </div>
    </footer>
  )
}
`,
}
