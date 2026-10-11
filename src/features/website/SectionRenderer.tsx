import type { WebsiteSection } from './schema'
import {
  AboutSection,
  CallToActionSection,
  ContactSection,
  FAQSection,
  FeaturesSection,
  FooterSection,
  GallerySection,
  HeroSection,
  PricingSection,
  ProductGridSection,
  ServicesSection,
  TeamSection,
  TestimonialsSection,
} from './sections'

export function SectionRenderer({ section }: { section: WebsiteSection }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />
    case 'features':
      return <FeaturesSection section={section} />
    case 'about':
      return <AboutSection section={section} />
    case 'services':
      return <ServicesSection section={section} />
    case 'product-grid':
      return <ProductGridSection section={section} />
    case 'pricing':
      return <PricingSection section={section} />
    case 'gallery':
      return <GallerySection section={section} />
    case 'testimonials':
      return <TestimonialsSection section={section} />
    case 'team':
      return <TeamSection section={section} />
    case 'faq':
      return <FAQSection section={section} />
    case 'contact':
      return <ContactSection section={section} />
    case 'cta':
      return <CallToActionSection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    default: {
      const unsupported: never = section
      return unsupported
    }
  }
}
