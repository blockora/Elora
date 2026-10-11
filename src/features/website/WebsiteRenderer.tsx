import type { CSSProperties } from 'react'
import type { WebsiteSpec } from './schema'
import { SectionRenderer } from './SectionRenderer'
import './website.css'

type ThemeVariables = CSSProperties & {
  '--site-primary': string
  '--site-background': string
  '--site-text': string
}

export function WebsiteRenderer({ spec }: { spec: WebsiteSpec }) {
  const theme: ThemeVariables = {
    '--site-primary': spec.theme.primaryColor,
    '--site-background': spec.theme.backgroundColor,
    '--site-text': spec.theme.textColor,
  }

  return (
    <article
      className={`generated-site generated-site--${spec.theme.mode}`}
      style={theme}
      aria-label={`${spec.name} website preview`}
    >
      {spec.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </article>
  )
}
