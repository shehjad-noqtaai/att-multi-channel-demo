// Shared types for the storefront. Kept thin — most types come from the
// Studio code we reuse via the @studio alias (see lib/portableText.ts, sanity/tokens.ts).

import type {MergeField, MinimalBrief} from '@studio/personalization/generate/tokens'

export type PersonaKey = 'new' | 'loyal' | 'business' | 'value'

export interface PortableTextSpan {
  _type: 'span'
  _key?: string
  text?: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: PortableTextSpan[]
  markDefs?: Array<{_key: string; _type: string; [key: string]: unknown}>
}

export interface HeroImage {
  alt?: string
  url?: string
  asset?: {_ref?: string} | null
}

export interface SegmentConfig {
  key: string
  title?: string
  brand?: string
  brandColor?: string
  logoUrl?: string | null
  brandDisclaimers?: string[]
}

export interface BriefSummary {
  _id: string
  _rev?: string
  title?: string
  slug?: string
  offer?: string
  mandatoryDisclaimers?: string[]
  featuredProduct?: unknown
  /** Required by MinimalBrief (extends from @studio tokens) — allows arbitrary additional fields. */
  [key: string]: unknown
}

export interface WebVariation {
  _id: string
  segment: string
  flowStep?: string
  generatedAt?: string
  brief: BriefSummary
  config: SegmentConfig | null
  mergeFields: MergeField[]
  web: {
    headline?: string
    subheadline?: string
    body?: PortableTextBlock[]
    ctaLabel?: string
    ctaUrl?: string
    heroImage?: HeroImage
  } | null
}

export interface OfferIndexEntry {
  _id: string
  title: string
  slug: string
  offer?: string
  personas: string[]
}

export interface TermsData {
  title?: string
  offer?: string
  mandatoryDisclaimers?: string[]
  persona: {
    title?: string
    brand?: string
    brandColor?: string
    brandDisclaimers?: string[]
  } | null
}

export type {MergeField, MinimalBrief}
