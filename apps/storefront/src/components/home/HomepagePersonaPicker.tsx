'use client'

import Link from 'next/link'
import {usePathname, useSearchParams} from 'next/navigation'
import {PERSONA_KEYS, PERSONAS} from '@/lib/personas'
import type {PersonaKey} from '@/types'

export function HomepagePersonaPicker({active}: {active: PersonaKey}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="att-persona-picker" role="group" aria-label="Preview persona">
      <span className="att-persona-picker__label">Preview as:</span>
      <ul className="att-persona-picker__list">
        {PERSONA_KEYS.map((key) => {
          const meta = PERSONAS[key]
          const params = new URLSearchParams(searchParams.toString())
          params.set('persona', key)
          const href = `${pathname}?${params.toString()}`
          const isActive = key === active
          return (
            <li key={key}>
              <Link
                href={href}
                className={`att-persona-picker__pill${isActive ? ' att-persona-picker__pill--active' : ''}`}
                style={
                  isActive
                    ? {backgroundColor: meta.brandColor, borderColor: meta.brandColor}
                    : {borderColor: meta.brandColor, color: meta.brandColor}
                }
                aria-current={isActive ? 'true' : undefined}
              >
                {meta.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
