// Static persona registry. Mirrors the four seeded `segment` docs in
// docs/SEED.md so the gallery and switcher can render even when offline /
// before a published variation exists for a given persona.

import type {PersonaKey} from '../types'

export interface PersonaMeta {
  key: PersonaKey
  title: string
  brand: 'att' | 'firstnet' | 'cricket'
  brandColor: string
}

export const PERSONAS: Record<PersonaKey, PersonaMeta> = {
  new: {key: 'new', title: 'New customers', brand: 'att', brandColor: '#00A8E0'},
  loyal: {key: 'loyal', title: 'Existing / Loyal', brand: 'att', brandColor: '#00A8E0'},
  business: {key: 'business', title: 'Business / FirstNet', brand: 'firstnet', brandColor: '#2B7A0B'},
  value: {key: 'value', title: 'Value / Cricket', brand: 'cricket', brandColor: '#80B82A'},
}

export const PERSONA_KEYS: PersonaKey[] = ['new', 'loyal', 'business', 'value']

export function getPersona(key: string): PersonaMeta | undefined {
  return (PERSONAS as Record<string, PersonaMeta>)[key]
}
