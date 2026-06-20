import type {HeroImage, PersonaKey, PortableTextBlock, SegmentConfig} from '@/types'

export interface HomepagePromoBar {
  enabled?: boolean
  message?: string
  linkLabel?: string
  linkUrl?: string
}

export interface HomepageStaticHero {
  eyebrow?: string
  headline?: string
  subheadline?: string
  ctaLabel?: string
  ctaUrl?: string
  backgroundImage?: HeroImage
}

export interface HomepagePersonalizedSlot {
  enabled?: boolean
  slotStyle?: 'hero' | 'banner' | 'promo'
  label?: string
  defaultPersona?: string
  staticFallback?: HomepageStaticHero
  campaignBrief?: {
    _id: string
    title?: string
    slug?: string
  } | null
}

export interface HomepagePromoCard {
  _key?: string
  badge?: string
  title?: string
  description?: string
  ctaLabel?: string
  ctaUrl?: string
  theme?: 'att' | 'fiber' | 'wireless'
  image?: HeroImage
}

export interface StorefrontHomepage {
  _id: string
  title?: string
  promoBar?: HomepagePromoBar
  primaryHero?: HomepagePersonalizedSlot
  personalizedBanners?: HomepagePersonalizedSlot[]
  promoGridTitle?: string
  promoCards?: HomepagePromoCard[]
  personalizedPromoSlots?: HomepagePersonalizedSlot[]
}

/** Resolved slot ready for render — variation merged or static fallback. */
export interface ResolvedHomepageSlot {
  slotStyle: 'hero' | 'banner' | 'promo'
  eyebrow?: string
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaUrl?: string
  heroImage?: HeroImage
  brandColor?: string
  logoUrl?: string | null
  brandTitle?: string
  briefSlug?: string
  persona?: PersonaKey
  isPersonalized: boolean
  body?: PortableTextBlock[]
  segment?: SegmentConfig | null
}
