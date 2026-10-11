import type { WebsiteSpec } from '../../features/website/schema'
import { sectionsDir } from './templateParts'

export interface ExportProject {
  name: string
  files: ExportFile[]
}

export interface ExportFile {
  path: string
  content: string
}

export function generateExportProject(
  spec: WebsiteSpec,
  projectName: string,
): ExportProject {
  const sanitizedName =
    projectName
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'elora-website'

  const websiteJson = JSON.stringify(spec, null, 2)

  const files: ExportFile[] = [
    // Root files
    {
      path: 'package.json',
      content: generatePackageJson(sanitizedName),
    },
    {
      path: 'index.html',
      content: generateIndexHtml(),
    },
    {
      path: 'README.md',
      content: generateReadme(projectName),
    },
    {
      path: 'tsconfig.json',
      content: generateTsconfig(),
    },
    {
      path: 'vite.config.ts',
      content: generateViteConfig(),
    },
    {
      path: 'src/main.tsx',
      content: generateMainTsx(),
    },
    {
      path: 'src/App.tsx',
      content: generateAppTsx(),
    },
    {
      path: 'src/style.css',
      content: generateStylesheet(),
    },
    {
      path: 'public/favicon.svg',
      content: generateFavicon(),
    },
    // Website data
    {
      path: 'src/data/website.json',
      content: websiteJson,
    },
    // Types file for the exported project
    {
      path: 'src/types/index.ts',
      content: generateTypes(),
    },
    // Website renderer
    {
      path: 'src/components/website/WebsiteRenderer.tsx',
      content: generateWebsiteRenderer(),
    },
    {
      path: 'src/components/website/SectionRenderer.tsx',
      content: generateSectionRenderer(),
    },
    // Sections
    {
      path: 'src/components/website/sections/HeroSection.tsx',
      content: sectionsDir.HeroSection,
    },
    {
      path: 'src/components/website/sections/FeaturesSection.tsx',
      content: sectionsDir.FeaturesSection,
    },
    {
      path: 'src/components/website/sections/AboutSection.tsx',
      content: sectionsDir.AboutSection,
    },
    {
      path: 'src/components/website/sections/ServicesSection.tsx',
      content: sectionsDir.ServicesSection,
    },
    {
      path: 'src/components/website/sections/ProductGridSection.tsx',
      content: sectionsDir.ProductGridSection,
    },
    {
      path: 'src/components/website/sections/PricingSection.tsx',
      content: sectionsDir.PricingSection,
    },
    {
      path: 'src/components/website/sections/GallerySection.tsx',
      content: sectionsDir.GallerySection,
    },
    {
      path: 'src/components/website/sections/TestimonialsSection.tsx',
      content: sectionsDir.TestimonialsSection,
    },
    {
      path: 'src/components/website/sections/TeamSection.tsx',
      content: sectionsDir.TeamSection,
    },
    {
      path: 'src/components/website/sections/FAQSection.tsx',
      content: sectionsDir.FAQSection,
    },
    {
      path: 'src/components/website/sections/ContactSection.tsx',
      content: sectionsDir.ContactSection,
    },
    {
      path: 'src/components/website/sections/CTASection.tsx',
      content: sectionsDir.CTASection,
    },
    {
      path: 'src/components/website/sections/FooterSection.tsx',
      content: sectionsDir.FooterSection,
    },
    {
      path: 'src/components/website/sections/index.ts',
      content: generateSectionsIndex(),
    },
  ]

  return {
    name: sanitizedName,
    files,
  }
}

function generatePackageJson(name: string): string {
  return `{
  "name": "${name}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.3",
    "vite": "^6.0.0"
  }
}
`
}

function generateIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated Website</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

function generateReadme(projectName: string): string {
  return `# ${projectName}

A website generated with [Elora](https://elora.dev) — an AI-powered website builder.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

The site will be available at \`http://localhost:5173\`.

### Production Build

Create a production build:

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist/\` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Customization

This website was generated from a specification. The website content and structure are defined in \`src/data/website.json\`.

The rendering components are in \`src/components/website/\`.

### Editing Content

1. Open \`src/data/website.json\` to modify the website specification
2. Re-run \`npm run dev\` to see changes

### Modifying Styles

Edit \`src/style.css\` to change global styles.

## Project Structure

\`\`\`
my-website/
  package.json          # Project dependencies and scripts
  index.html            # HTML entry point
  README.md             # This file
  tsconfig.json         # TypeScript configuration
  vite.config.ts        # Vite configuration
  src/
    main.tsx            # React entry point
    App.tsx             # Main React component
    style.css           # Global styles
    data/
      website.json      # Website specification
    components/
      website/
        WebsiteRenderer.tsx   # Main website renderer
        SectionRenderer.tsx   # Section type dispatcher
        sections/
          HeroSection.tsx
          FeaturesSection.tsx
          ... (other section components)
          index.ts             # Section exports
    types/
      index.ts          # Type definitions
  public/
    favicon.svg         # Site favicon
\`\`\`

## Technologies

- **React 18** — UI framework
- **TypeScript** — Type-safe JavaScript
- **Vite** — Build tool and dev server

## License

This project is generated by Elora and is free to use, modify, and distribute.
`
}

function generateTsconfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`
}

function generateMainTsx(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`
}

function generateAppTsx(): string {
  return `import { WebsiteRenderer } from './components/website/WebsiteRenderer'
import websiteSpec from './data/website.json'

export default function App() {
  return <WebsiteRenderer spec={websiteSpec} />
}
`
}

function generateStylesheet(): string {
  return `/* Global Styles for Generated Website */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
}

/* Utility classes can be added here */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .section {
    padding: 48px 0;
  }
}
`
}

function generateFavicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#d99b72"/>
  <text x="16" y="22" text-anchor="middle" fill="#211a17" font-family="system-ui" font-size="18" font-weight="bold">E</text>
</svg>
`
}

function generateTypes(): string {
  return `// Type definitions for the generated website
export interface WebsiteTheme {
  mode: 'light' | 'dark'
  primaryColor: string
  backgroundColor: string
  textColor: string
}

export interface HeroSectionData {
  id: string
  type: 'hero'
  title: string
  subtitle?: string
  ctaLabel?: string
}

export interface FeaturesSectionData {
  id: string
  type: 'features'
  title: string
  items?: Array<{
    title: string
    description: string
  }>
}

export interface AboutSectionData {
  id: string
  type: 'about'
  title: string
  body?: string
}

export interface ServicesSectionData {
  id: string
  type: 'services'
  title: string
  items?: Array<{
    name: string
    description: string
  }>
}

export interface ProductGridSectionData {
  id: string
  type: 'product-grid'
  title: string
  items?: Array<{
    name: string
    description?: string
    price?: string
  }>
}

export interface PricingSectionData {
  id: string
  type: 'pricing'
  title: string
  plans?: Array<{
    name: string
    price: string
    description?: string
  }>
}

export interface GallerySectionData {
  id: string
  type: 'gallery'
  title: string
  captions?: string[]
}

export interface TestimonialsSectionData {
  id: string
  type: 'testimonials'
  title: string
  quotes?: Array<{
    quote: string
    author: string
  }>
}

export interface TeamSectionData {
  id: string
  type: 'team'
  title: string
  members?: Array<{
    name: string
    role?: string
  }>
}

export interface FAQSectionData {
  id: string
  type: 'faq'
  title: string
  items?: Array<{
    question: string
    answer: string
  }>
}

export interface ContactSectionData {
  id: string
  type: 'contact'
  title: string
  email?: string
  phone?: string
  address?: string
}

export interface CTASectionData {
  id: string
  type: 'cta'
  title?: string
  body?: string
  ctaLabel?: string
}

export interface FooterSectionData {
  id: string
  type: 'footer'
  title?: string
}

export type WebsiteSection =
  | HeroSectionData
  | FeaturesSectionData
  | AboutSectionData
  | ServicesSectionData
  | ProductGridSectionData
  | PricingSectionData
  | GallerySectionData
  | TestimonialsSectionData
  | TeamSectionData
  | FAQSectionData
  | ContactSectionData
  | CTASectionData
  | FooterSectionData

export interface WebsiteSpec {
  name: string
  description: string
  theme: WebsiteTheme
  sections: WebsiteSection[]
}
`
}

function generateWebsiteRenderer(): string {
  return `import { SectionRenderer } from './SectionRenderer'
import type { WebsiteSpec } from '../../types'

interface WebsiteRendererProps {
  spec: WebsiteSpec
}

export function WebsiteRenderer({ spec }: WebsiteRendererProps) {
  const { theme, sections } = spec

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        minHeight: '100vh',
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  )
}
`
}

function generateSectionRenderer(): string {
  return `import type { WebsiteSection } from '../../types'
import { HeroSection } from './sections/HeroSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { AboutSection } from './sections/AboutSection'
import { ServicesSection } from './sections/ServicesSection'
import { ProductGridSection } from './sections/ProductGridSection'
import { PricingSection } from './sections/PricingSection'
import { GallerySection } from './sections/GallerySection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { TeamSection } from './sections/TeamSection'
import { FAQSection } from './sections/FAQSection'
import { ContactSection } from './sections/ContactSection'
import { CTASection } from './sections/CTASection'
import { FooterSection } from './sections/FooterSection'

interface SectionRendererProps {
  section: WebsiteSection
}

export function SectionRenderer({ section }: SectionRendererProps) {
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
      return <CTASection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    default:
      return null
  }
}
`
}

function generateSectionsIndex(): string {
  return `// Section components
export { HeroSection } from './HeroSection'
export { FeaturesSection } from './FeaturesSection'
export { AboutSection } from './AboutSection'
export { ServicesSection } from './ServicesSection'
export { ProductGridSection } from './ProductGridSection'
export { PricingSection } from './PricingSection'
export { GallerySection } from './GallerySection'
export { TestimonialsSection } from './TestimonialsSection'
export { TeamSection } from './TeamSection'
export { FAQSection } from './FAQSection'
export { ContactSection } from './ContactSection'
export { CTASection } from './CTASection'
export { FooterSection } from './FooterSection'
`
}
