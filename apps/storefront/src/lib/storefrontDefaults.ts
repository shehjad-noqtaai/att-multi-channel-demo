import type {StorefrontHomepage, PromoCard} from '@/types/storefront'
import {FIBER_FAQ_ITEMS} from '@/lib/fiberFaqDefaults'
import {buildDefaultPageSections, resolvePageSections} from '@/lib/pageSections'

const DEFAULT_PROMO_CARDS: PromoCard[] = [
  {
    _key: 'card-iphone',
    badge: 'New & existing customers',
    title: 'Get iPhone 17 Pro for $0',
    description: 'Learn how to get this offer with eligible trade-in.',
    legalNote: 'Req. eligible plan. Terms and restrictions apply. Subject to change.',
    legalLinkLabel: 'See offer details',
    legalLinkUrl: 'https://www.att.com/',
    ctaLabel: 'Shop now',
    ctaUrl: 'https://www.att.com/',
    theme: 'wireless',
    layout: 'flex',
    imageUrl:
      'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-lg-iphone17pro-dsk-tall-retina.png',
  },
  {
    _key: 'card-wireless',
    badge: 'Learn how to',
    title: 'Get $200 off per line',
    description:
      'When you call or order online and get an eligible wireless plan with a new phone line.',
    legalNote: 'Limited time. $5.56/mo. bill credit for 36 mos. Other terms apply.',
    legalLinkLabel: 'See offer details',
    legalLinkUrl: 'https://www.att.com/deals/',
    ctaLabel: 'Shop now',
    ctaUrl: 'https://www.att.com/deals/',
    secondaryCtaLabel: 'Call 877.799.0828 ›',
    secondaryCtaUrl: 'tel:+18777990828',
    theme: 'wireless',
    layout: 'flex',
    imageUrl:
      'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-sm-newline-v2-dsk-tall-retina.jpg',
  },
]

/** Legacy content bag used to build default page sections. */
const DEFAULT_LEGACY_CONTENT: Omit<StorefrontHomepage, '_id' | 'title'> = {
  primaryHero: {
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
  promoGridTitle: 'Great connections start here',
  featureBlock: {
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
  },
  resourceSection: {
    enabled: true,
    title: 'AT&T Home Phone: More resources',
    cards: [
      {
        _key: 'resource-phone-advanced',
        title: 'AT&T Phone Advanced',
        description:
          'AT&T Phone – Advanced uses the latest technology to support your current phone and includes all the popular features you know and love.',
        ctaLabel: 'Learn more ›',
        ctaUrl: 'https://www.att.com/home-phone/phone-advanced/',
        imageUrl:
          'https://www.att.com/scmsassets/sales/uf/internet/fiber/rivercard/1466807-rivercard-PhoneAdvanced-02-dsk-retina.jpg',
      },
      {
        _key: 'resource-lifeline',
        title: 'AT&T Lifeline',
        description:
          'If you are in a qualifying household, you may be able to reduce your bill by getting a Lifeline benefit on your home phone service with AT&T.',
        ctaLabel: 'Learn more ›',
        ctaUrl: 'https://www.att.com/home-phone/lifeline/',
        imageUrl:
          'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard-affordableservice-dsk-retina.jpg',
      },
      {
        _key: 'resource-helpful',
        title: 'Helpful resources',
        links: [
          {label: 'Landline Customer Service', href: 'https://www.att.com/support/home-phone/'},
          {
            label: 'Calling Features and Star Codes',
            href: 'https://www.att.com/support/article/home-phone/KM1000456/',
          },
          {
            label: 'Home Phone Maintenance Plans',
            href: 'https://www.att.com/support/article/home-phone/KM1000457/',
          },
          {
            label: 'Lifeline California',
            href: 'https://www.att.com/support/article/home-phone/KM1000458/',
          },
        ],
        imageUrl:
          'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard2-phoneaccessories-dsk-retina.jpg',
      },
    ],
  },
  faqSection: {
    enabled: true,
    title: 'Frequently asked questions',
    expandAllLabel: 'Expand all',
    collapseAllLabel: 'Collapse all',
    initialVisibleCount: 7,
    viewMoreLabel: 'View more',
    viewMoreUrl: 'https://www.att.com/internet/fiber/',
    items: FIBER_FAQ_ITEMS,
  },
  promoCards: DEFAULT_PROMO_CARDS,
}

/** Defaults used when CMS fields are null or the fetch fails entirely. */
export const DEFAULT_STOREFRONT: StorefrontHomepage = {
  _id: 'fallback',
  title: 'AT&T Homepage',
  promoBar: {
    enabled: false,
    message: 'Switch to AT&T and learn how to get up to $800/line to break your contract.',
    linkLabel: 'Shop now',
    linkUrl: 'https://www.att.com/',
  },
  promoLegalNote: {
    enabled: false,
    text: 'Up to $800 via reward card (redemption required). Restrictions apply.',
    linkLabel: 'See offer details',
    linkUrl: 'https://www.att.com/',
  },
  orderCta: {
    enabled: true,
    phoneLabel: 'ORDER NOW',
    phoneNumber: '844-249-5043',
    phoneHref: 'tel:+18442495043',
  },
  sections: buildDefaultPageSections(DEFAULT_LEGACY_CONTENT),
  ...DEFAULT_LEGACY_CONTENT,
}

function mergePromoCards(
  cmsCards: PromoCard[] | undefined,
  defaults: PromoCard[],
): PromoCard[] {
  if (!cmsCards?.length) return defaults
  const defaultByKey = new Map(defaults.map((c) => [c._key, c]))
  const merged = cmsCards.map((card, i) => {
    const fallback = (card._key && defaultByKey.get(card._key)) ?? defaults[i]
    if (!fallback) return card
    return {
      ...fallback,
      ...card,
      imageUrl:
        card.imageUrl ??
        card.image?.url ??
        (card.image?.asset?._ref ? undefined : fallback.imageUrl),
    }
  })
  for (const def of defaults) {
    if (def._key && !merged.some((c) => c._key === def._key)) {
      merged.push(def)
    }
  }
  return merged
}

/** Merge CMS homepage with defaults so partial/old seeds still render fully. */
export function mergeStorefrontWithDefaults(
  cms: StorefrontHomepage | null | undefined,
): StorefrontHomepage {
  if (!cms) return DEFAULT_STOREFRONT

  const merged: StorefrontHomepage = {
    ...DEFAULT_STOREFRONT,
    ...cms,
    promoBar: cms.promoBar ?? DEFAULT_STOREFRONT.promoBar,
    promoLegalNote: cms.promoLegalNote ?? DEFAULT_STOREFRONT.promoLegalNote,
    orderCta: cms.orderCta ?? DEFAULT_STOREFRONT.orderCta,
    promoCards: mergePromoCards(cms.promoCards, DEFAULT_PROMO_CARDS),
    primaryHero: cms.primaryHero ?? DEFAULT_STOREFRONT.primaryHero,
    featureBlock: cms.featureBlock ?? DEFAULT_STOREFRONT.featureBlock,
    resourceSection: cms.resourceSection ?? DEFAULT_STOREFRONT.resourceSection,
    faqSection: cms.faqSection ?? DEFAULT_STOREFRONT.faqSection,
    promoGridTitle: cms.promoGridTitle ?? DEFAULT_STOREFRONT.promoGridTitle,
  }

  merged.sections = resolvePageSections(merged)
  return merged
}

export {resolvePageSections}
