import type {HeroImage, PersonaKey, PortableTextBlock, SegmentConfig} from '@/types'
import type {PageSection} from '@/lib/pageSections'

export interface NavLink {
  label?: string
  href?: string
  openInNewTab?: boolean
}

export interface SiteHeader {
  utilityLinks?: NavLink[]
  logoImage?: HeroImage
  logoImageUrl?: string
  logoText?: string
  primaryNav?: NavLink[]
  actionLink?: NavLink
}

export interface FooterLinkGroup {
  title?: string
  links?: NavLink[]
}

export interface SiteFooter {
  linkGroups?: FooterLinkGroup[]
  legalText?: string
  copyright?: string
}

export interface LegalNote {
  enabled?: boolean
  text?: string
  linkLabel?: string
  linkUrl?: string
}

export interface OrderCta {
  enabled?: boolean
  phoneLabel?: string
  phoneNumber?: string
  phoneHref?: string
}

export interface PromoBar {
  enabled?: boolean
  message?: string
  linkLabel?: string
  linkUrl?: string
}

export interface StaticHero {
  eyebrow?: string
  headline?: string
  subheadline?: string
  ctaLabel?: string
  ctaUrl?: string
  backgroundImage?: HeroImage
  backgroundImageUrl?: string
}

export interface PersonalizedSlot {
  enabled?: boolean
  slotStyle?: 'hero' | 'banner' | 'promo'
  label?: string
  defaultPersona?: string
  staticFallback?: StaticHero
  campaignBrief?: {
    _id: string
    title?: string
    slug?: string
    multiStep?: boolean
  } | null
}

export interface FeatureBlock {
  enabled?: boolean
  eyebrow?: string
  title?: string
  description?: string
  bullets?: string[]
  legalNote?: string
  ctaLabel?: string
  ctaUrl?: string
  image?: HeroImage
  imageUrl?: string
}

export interface ResourceCard {
  _key?: string
  title?: string
  description?: string
  links?: NavLink[]
  ctaLabel?: string
  ctaUrl?: string
  image?: HeroImage
  imageUrl?: string
}

export interface ResourceSection {
  enabled?: boolean
  title?: string
  cards?: ResourceCard[]
}

export interface FaqItem {
  _key?: string
  question?: string
  answer?: string
  bullets?: string[]
}

export interface FaqSection {
  enabled?: boolean
  title?: string
  expandAllLabel?: string
  collapseAllLabel?: string
  items?: FaqItem[]
  initialVisibleCount?: number
  viewMoreLabel?: string
  viewMoreUrl?: string
}

export interface PromoCard {
  _key?: string
  badge?: string
  title?: string
  description?: string
  ctaLabel?: string
  ctaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  legalNote?: string
  legalLinkLabel?: string
  legalLinkUrl?: string
  layout?: 'flex' | 'stack'
  theme?: 'att' | 'fiber' | 'wireless'
  image?: HeroImage
  imageUrl?: string
}

export interface StorefrontHomepage {
  _id: string
  title?: string
  header?: SiteHeader
  promoBar?: PromoBar
  promoLegalNote?: LegalNote
  orderCta?: OrderCta
  footer?: SiteFooter
  /** Page-builder sections (preferred). */
  sections?: PageSection[]
  /** @deprecated Legacy flat fields — used only when `sections` is empty. */
  primaryHero?: PersonalizedSlot
  abandonedCartHero?: PersonalizedSlot
  personalizedBanners?: PersonalizedSlot[]
  promoGridTitle?: string
  featureBlock?: FeatureBlock
  resourceSection?: ResourceSection
  faqSection?: FaqSection
  promoCards?: PromoCard[]
  personalizedPromoSlots?: PersonalizedSlot[]
}

/** Resolved slot ready for render — variation merged or static fallback. */
export interface ResolvedPersonalizedSlot {
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
