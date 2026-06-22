import type {
  FeatureBlock,
  FaqSection,
  PersonalizedSlot,
  PromoCard,
  ResourceSection,
  StorefrontHomepage,
} from '@/types/storefront'
import type {CampaignPreviewKey} from '@/lib/campaignPreview'
import {FIBER_FAQ_ITEMS} from '@/lib/fiberFaqDefaults'

export interface PageSectionHero {
  _type: 'pageSectionHero'
  _key?: string
  campaignPreview?: CampaignPreviewKey
  slot?: PersonalizedSlot
}

export interface PageSectionBanner {
  _type: 'pageSectionBanner'
  _key?: string
  campaignPreview?: CampaignPreviewKey | 'always'
  slots?: PersonalizedSlot[]
}

export interface PageSectionFeatureGroup {
  _type: 'pageSectionFeatureGroup'
  _key?: string
  sectionTitle?: string
  block?: FeatureBlock
}

export interface PageSectionResourceCards {
  _type: 'pageSectionResourceCards'
  _key?: string
  section?: ResourceSection
}

export interface PageSectionFaq {
  _type: 'pageSectionFaq'
  _key?: string
  section?: FaqSection
}

export interface PageSectionPromoBand {
  _type: 'pageSectionPromoBand'
  _key?: string
  cards?: PromoCard[]
}

export type PageSection =
  | PageSectionHero
  | PageSectionBanner
  | PageSectionFeatureGroup
  | PageSectionResourceCards
  | PageSectionFaq
  | PageSectionPromoBand

/** Default page-builder layout matching the current homepage. */
export function buildDefaultPageSections(
  overrides?: Partial<StorefrontHomepage>,
): PageSection[] {
  const cms = {...overrides}
  const featureBlock = cms.featureBlock ?? {
    enabled: true,
    eyebrow: 'Current home phone customers',
    title: 'Discover digital phone technology',
    description: 'Enjoy more of the connections you already love.',
    bullets: [
      'Functions just like your current phone service',
      'Keeps you connected with family and friends',
      'Works in unison with fast, reliable AT&T internet service',
    ],
    legalNote:
      'AT&T Phone may require an internet connection provided by AT&T for an add\u2019l cost.',
    ctaLabel: 'Call 844.886.4258',
    ctaUrl: 'tel:+18448864258',
    imageUrl:
      'https://www.att.com/scmsassets/upper_funnel/other/1735850-offer-greatplan-dsk-retina.jpg',
  }

  return [
    {
      _type: 'pageSectionHero',
      _key: 'hero-trade-in',
      campaignPreview: 'trade-in',
      slot: cms.primaryHero ?? {
        enabled: true,
        slotStyle: 'hero',
        defaultPersona: 'new',
        staticFallback: {
          eyebrow: 'New & existing customers',
          headline: 'Get iPhone 17 Pro for $0',
          subheadline: 'Learn how to get this offer with eligible trade-in.',
          ctaLabel: 'Shop now',
          ctaUrl: 'https://www.att.com/',
          backgroundImageUrl:
            'https://www.att.com/scmsassets/upper_funnel/wireless/5085200-flex-card-bg-b1-dsk-retina.jpg',
        },
      },
    },
    {
      _type: 'pageSectionHero',
      _key: 'hero-abandoned-cart',
      campaignPreview: 'abandoned-cart',
      slot: cms.abandonedCartHero ?? {
        enabled: true,
        slotStyle: 'hero',
        defaultPersona: 'new',
        staticFallback: {
          eyebrow: 'AT&T Fiber',
          headline: 'Your AT&T Fiber order is saved and ready when you are',
          subheadline: 'Pick up where you left off — complete your order in minutes.',
          ctaLabel: 'Complete my order',
          ctaUrl: 'https://www.att.com/internet/fiber/',
          backgroundImageUrl:
            'https://www.att.com/scmsassets/upper_funnel/internet/7110800-base-hero-150ff-lt-blue-hp-dsk-retina.jpg',
        },
      },
    },
    ...(cms.personalizedBanners?.length
      ? [
          {
            _type: 'pageSectionBanner' as const,
            _key: 'banner-fiber',
            campaignPreview: 'trade-in' as const,
            slots: cms.personalizedBanners,
          },
        ]
      : []),
    {
      _type: 'pageSectionFeatureGroup',
      _key: 'feature-home-phone',
      sectionTitle: cms.promoGridTitle ?? 'Great connections start here',
      block: featureBlock,
    },
    {
      _type: 'pageSectionResourceCards',
      _key: 'resources-home-phone',
      section: cms.resourceSection ?? {
        enabled: true,
        title: 'AT&T Home Phone: More resources',
        cards: [],
      },
    },
    {
      _type: 'pageSectionFaq',
      _key: 'faq-fiber',
      section: cms.faqSection ?? {
        enabled: true,
        title: 'Frequently asked questions',
        expandAllLabel: 'Expand all',
        collapseAllLabel: 'Collapse all',
        initialVisibleCount: 7,
        viewMoreLabel: 'View more',
        viewMoreUrl: 'https://www.att.com/internet/fiber/',
        items: FIBER_FAQ_ITEMS,
      },
    },
    {
      _type: 'pageSectionPromoBand',
      _key: 'promo-flex-band',
      cards: cms.promoCards ?? [],
    },
  ]
}

/** Prefer CMS sections; fall back to legacy flat fields, then defaults. */
export function resolvePageSections(cms: StorefrontHomepage): PageSection[] {
  if (cms.sections?.length) return cms.sections
  return buildDefaultPageSections(cms)
}

export function sectionMatchesCampaign(
  campaignPreview: CampaignPreviewKey | 'always' | undefined,
  active: CampaignPreviewKey,
): boolean {
  if (!campaignPreview || campaignPreview === 'always') return true
  return campaignPreview === active
}
