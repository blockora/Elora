import type { WebsiteSection } from '../schema'

type SectionOf<T extends WebsiteSection['type']> = Extract<
  WebsiteSection,
  { type: T }
>
type Props<T extends WebsiteSection['type']> = { section: SectionOf<T> }

function SectionFrame({
  id,
  className,
  children,
}: {
  id: string
  className: string
  children: React.ReactNode
}) {
  return (
    <section className={`site-section ${className}`} id={id}>
      {children}
    </section>
  )
}

function Heading({ title }: { title: string }) {
  return <h2 className="site-section__title">{title}</h2>
}

function ItemCards({
  items,
}: {
  items: Array<{ title: string; description: string }>
}) {
  return (
    <div className="site-card-grid">
      {items.map((item, index) => (
        <article className="site-card" key={`${item.title}-${index}`}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  )
}

export function HeroSection({ section }: Props<'hero'>) {
  return (
    <SectionFrame id={section.id} className="site-hero">
      <h1 className="site-eyebrow">{section.title}</h1>
      {section.subtitle && (
        <p className="site-hero__subtitle">{section.subtitle}</p>
      )}
      {section.ctaLabel && (
        <span className="site-button">{section.ctaLabel}</span>
      )}
    </SectionFrame>
  )
}

export function FeaturesSection({ section }: Props<'features'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.items?.length ? (
        <ItemCards items={section.items} />
      ) : (
        <p className="site-muted">Add details to introduce your features.</p>
      )}
    </SectionFrame>
  )
}

export function AboutSection({ section }: Props<'about'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      <p className="site-body">
        {section.body || 'A little more about what makes this place special.'}
      </p>
    </SectionFrame>
  )
}

export function ServicesSection({ section }: Props<'services'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.items?.length ? (
        <ul className="site-list">
          {section.items.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="site-muted">Services will be introduced here.</p>
      )}
    </SectionFrame>
  )
}

export function ProductGridSection({ section }: Props<'product-grid'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.items?.length ? (
        <div className="site-card-grid">
          {section.items.map((item, index) => (
            <article className="site-card" key={`${item.name}-${index}`}>
              <h3>{item.name}</h3>
              {item.description && <p>{item.description}</p>}
              {item.price && (
                <strong className="site-price">{item.price}</strong>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="site-muted">Products will appear here.</p>
      )}
    </SectionFrame>
  )
}

export function PricingSection({ section }: Props<'pricing'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.plans?.length ? (
        <div className="site-card-grid">
          {section.plans.map((plan, index) => (
            <article className="site-card" key={`${plan.name}-${index}`}>
              <h3>{plan.name}</h3>
              <strong className="site-price">{plan.price}</strong>
              {plan.description && <p>{plan.description}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="site-muted">Pricing options will appear here.</p>
      )}
    </SectionFrame>
  )
}

export function GallerySection({ section }: Props<'gallery'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.captions?.length ? (
        <div className="site-gallery">
          {section.captions.map((caption, index) => (
            <figure className="site-gallery__item" key={`${caption}-${index}`}>
              <span aria-hidden="true">✳</span>
              <figcaption>{caption || `Gallery image ${index + 1}`}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="site-muted">A gallery can be added here.</p>
      )}
    </SectionFrame>
  )
}

export function TestimonialsSection({ section }: Props<'testimonials'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.quotes?.length ? (
        <div className="site-card-grid">
          {section.quotes.map((item, index) => (
            <blockquote className="site-card" key={`${item.author}-${index}`}>
              <p>“{item.quote}”</p>
              <cite>{item.author}</cite>
            </blockquote>
          ))}
        </div>
      ) : (
        <p className="site-muted">Customer stories will appear here.</p>
      )}
    </SectionFrame>
  )
}

export function TeamSection({ section }: Props<'team'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.members?.length ? (
        <div className="site-card-grid">
          {section.members.map((member, index) => (
            <article className="site-card" key={`${member.name}-${index}`}>
              <h3>{member.name}</h3>
              {member.role && <p>{member.role}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="site-muted">Meet the people behind the work.</p>
      )}
    </SectionFrame>
  )
}

export function FAQSection({ section }: Props<'faq'>) {
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {section.items?.length ? (
        <div className="site-faq">
          {section.items.map((item, index) => (
            <details key={`${item.question}-${index}`}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      ) : (
        <p className="site-muted">
          Answers to common questions will appear here.
        </p>
      )}
    </SectionFrame>
  )
}

export function ContactSection({ section }: Props<'contact'>) {
  const details = [section.email, section.phone, section.address].filter(
    (value): value is string => Boolean(value),
  )
  return (
    <SectionFrame id={section.id} className="site-content-section">
      <Heading title={section.title} />
      {details.length ? (
        <address className="site-contact">
          {details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </address>
      ) : (
        <p className="site-muted">Contact details will appear here.</p>
      )}
    </SectionFrame>
  )
}

export function CallToActionSection({ section }: Props<'cta'>) {
  return (
    <SectionFrame id={section.id} className="site-cta-section">
      <Heading title={section.title} />
      {section.body && <p>{section.body}</p>}
      {section.ctaLabel && (
        <span className="site-button">{section.ctaLabel}</span>
      )}
    </SectionFrame>
  )
}

export function FooterSection({ section }: Props<'footer'>) {
  return (
    <footer className="site-footer" id={section.id}>
      <span>{section.title}</span>
      <span>Made with care</span>
    </footer>
  )
}
