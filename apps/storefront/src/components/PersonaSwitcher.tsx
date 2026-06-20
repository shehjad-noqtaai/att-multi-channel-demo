import Link from 'next/link'
import {PERSONAS, type PersonaMeta} from '../lib/personas'
import type {PersonaKey} from '../types'

interface PersonaSwitcherProps {
  briefSlug: string
  activePersona: PersonaKey
  /** Persona keys with a published web variation for the current brief. */
  available: string[]
  /**
   * Optional brief picker: every brief that has variations. When present, a
   * <select> renders alongside the pills so the visitor can hop briefs.
   */
  briefs?: Array<{slug: string; title: string}>
}

/**
 * PersonaSwitcher — server component. Each pill is a real `<Link>` so
 * persona changes are honest navigations (server re-fetch picks the matching
 * variation, not a client-only swap). No client state needed; staying server
 * keeps the bundle thin per Storefront PLAN §3.
 */
export function PersonaSwitcher({briefSlug, activePersona, available, briefs}: PersonaSwitcherProps) {
  const availableSet = new Set(available)
  const pills: PersonaMeta[] = Object.values(PERSONAS).filter((p) => availableSet.has(p.key))

  return (
    <nav className="persona-switcher" aria-label="Persona switcher">
      {briefs && briefs.length > 1 ? (
        <form className="persona-switcher__brief" action="" method="get" aria-label="Choose brief">
          {/*
            Plain HTML <select> with a submit-on-change pattern is fine here,
            but to stay server-only we just render labels as links below the
            select. The select itself is decorative for now.
          */}
          <span className="persona-switcher__label">Brief:</span>
          <span className="persona-switcher__brief-name">
            {briefs.find((b) => b.slug === briefSlug)?.title ?? briefSlug}
          </span>
        </form>
      ) : null}
      <ul className="persona-switcher__pills">
        {pills.map((p) => {
          const isActive = p.key === activePersona
          const href = `/offer/${briefSlug}/${p.key}`
          return (
            <li key={p.key}>
              <Link
                href={href}
                prefetch
                className={`persona-pill${isActive ? ' persona-pill--active' : ''}`}
                style={isActive ? {background: p.brandColor, borderColor: p.brandColor} : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {p.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
