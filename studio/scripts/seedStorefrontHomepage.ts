// studio/scripts/seedStorefrontHomepage.ts
//
// Idempotent seed for the storefront homepage singleton (att.com-style shell +
// personalized hero wired to the iPhone trade-in brief). Wires images from
// mediaAsset docs when present (run importAttMediaToLibrary.ts first).
//
//   set -a; . studio/.env; set +a; npx tsx studio/scripts/seedStorefrontHomepage.ts
//
// If studio/.env SANITY_AUTH_TOKEN lacks project access, use the storefront token:
//   set -a; . apps/storefront/.env; set +a; npx tsx studio/scripts/seedStorefrontHomepage.ts

import {createClient, type SanityClient} from '@sanity/client'
import {FIBER_FAQ_ITEMS} from '../../apps/storefront/src/lib/fiberFaqDefaults'

const ref = (id: string) => ({_type: 'reference', _ref: id})

/** att.com CDN fallbacks when mediaAsset docs are not yet imported. */
const ATT_CDN: Record<string, string> = {
  'att-logo-globe':
    'https://www.att.com/scmsassets/global/logos/att-logos/vertical/att_globe_500x500.jpg',
  'att-fiber-hero':
    'https://www.att.com/scmsassets/upper_funnel/internet/7110800-base-hero-150ff-lt-blue-hp-dsk-retina.jpg',
  'att-wireless-card-bg':
    'https://www.att.com/scmsassets/upper_funnel/wireless/5085200-flex-card-bg-b1-dsk-retina.jpg',
  'att-iphone17-pro-card':
    'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-lg-iphone17pro-dsk-tall-retina.png',
  'att-new-line-card':
    'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-sm-newline-v2-dsk-tall-retina.jpg',
  'att-home-phone-feature':
    'https://www.att.com/scmsassets/upper_funnel/other/1735850-offer-greatplan-dsk-retina.jpg',
  'att-home-phone-advanced-card':
    'https://www.att.com/scmsassets/sales/uf/internet/fiber/rivercard/1466807-rivercard-PhoneAdvanced-02-dsk-retina.jpg',
  'att-home-phone-lifeline-card':
    'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard-affordableservice-dsk-retina.jpg',
  'att-home-phone-helpful-card':
    'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard2-phoneaccessories-dsk-retina.jpg',
}

interface MediaAssetDoc {
  _id: string
  title?: string
  url?: string
  image?: {asset?: {_ref?: string}; alt?: string}
}

async function loadMediaAssets(client: SanityClient, ids: string[]) {
  try {
    const docs = await client.fetch<MediaAssetDoc[]>(
      `*[_type == "mediaAsset" && _id in $ids]{_id, title, url, image{alt, asset}}`,
      {ids: ids.map((id) => `mediaAsset-${id}`)},
    )
    return new Map(docs.map((d) => [d._id.replace(/^mediaAsset-/, ''), d]))
  } catch (e) {
    console.warn(
      '[seedStorefrontHomepage] Could not load mediaAsset docs — using att.com CDN fallbacks.',
    )
    console.warn(`       ${e instanceof Error ? e.message : String(e)}`)
    return new Map<string, MediaAssetDoc>()
  }
}

function imageFromMedia(id: string, doc: MediaAssetDoc | undefined) {
  if (doc) {
    const alt = doc.image?.alt ?? doc.title
    if (doc.image?.asset?._ref) {
      return {
        image: {
          _type: 'image',
          asset: {_type: 'reference', _ref: doc.image.asset._ref},
          alt,
        },
      }
    }
    if (doc.url) return {imageUrl: doc.url}
  }
  const cdn = ATT_CDN[id]
  return cdn ? {imageUrl: cdn} : {}
}

function logoFromMedia(id: string, doc: MediaAssetDoc | undefined) {
  if (doc) {
    const alt = doc.image?.alt ?? doc.title
    if (doc.image?.asset?._ref) {
      return {
        logoImage: {
          _type: 'image',
          asset: {_type: 'reference', _ref: doc.image.asset._ref},
          alt,
        },
      }
    }
    if (doc.url) return {logoImageUrl: doc.url}
  }
  const cdn = ATT_CDN[id]
  return cdn ? {logoImageUrl: cdn} : {}
}

function bgFromMedia(id: string, doc: MediaAssetDoc | undefined) {
  if (doc) {
    const alt = doc.image?.alt ?? doc.title
    if (doc.image?.asset?._ref) {
      return {
        backgroundImage: {
          _type: 'image',
          asset: {_type: 'reference', _ref: doc.image.asset._ref},
          alt,
        },
      }
    }
    if (doc.url) return {backgroundImageUrl: doc.url}
  }
  const cdn = ATT_CDN[id]
  return cdn ? {backgroundImageUrl: cdn} : {}
}

async function main() {
  const token =
    process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('SANITY_AUTH_TOKEN env var required')

  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'z6s0fz61',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    token,
    useCdn: false,
    apiVersion: '2024-10-01',
  })

  const media = await loadMediaAssets(client, [
    'att-logo-globe',
    'att-fiber-hero',
    'att-wireless-card-bg',
    'att-iphone17-pro-card',
    'att-new-line-card',
    'att-home-phone-feature',
    'att-home-phone-advanced-card',
    'att-home-phone-lifeline-card',
    'att-home-phone-helpful-card',
  ])

  const doc = {
    _id: 'storefront-homepage',
    _type: 'storefrontHomepage',
    title: 'AT&T Homepage',
    header: {
      utilityLinks: [
        {label: 'Personal', href: 'https://www.att.com/', openInNewTab: false},
        {label: 'Business', href: 'https://www.att.com/business/', openInNewTab: true},
        {label: 'Find a store', href: 'https://www.att.com/stores/', openInNewTab: true},
      ],
      ...logoFromMedia('att-logo-globe', media.get('att-logo-globe')),
      logoText: 'AT&T',
      primaryNav: [
        {label: 'Shop', href: 'https://www.att.com/shop/'},
        {label: 'Deals', href: 'https://www.att.com/deals/'},
        {label: 'AT&T Difference', href: 'https://www.att.com/why-att/'},
        {label: 'Support', href: 'https://www.att.com/support/'},
      ],
      actionLink: {label: 'Personalized offers', href: 'http://localhost:3000/offers'},
    },
    promoBar: {
      enabled: false,
      message:
        'Switch to AT&T and learn how to get up to $800/line to break your contract.',
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
    sections: [
      {
        _key: 'hero-trade-in',
        _type: 'pageSectionHero',
        campaignPreview: 'trade-in',
        slot: {
          enabled: true,
          slotStyle: 'hero',
          label: 'Primary hero — iPhone trade-in',
          campaignBrief: ref('brief-iphone17-tradein'),
          defaultPersona: 'new',
          staticFallback: {
            eyebrow: 'New & existing customers',
            headline: 'Get iPhone 17 Pro for $0',
            subheadline: 'Learn how to get this offer with eligible trade-in.',
            ctaLabel: 'Shop now',
            ctaUrl: 'https://www.att.com/',
            ...bgFromMedia('att-wireless-card-bg', media.get('att-wireless-card-bg')),
          },
        },
      },
      {
        _key: 'hero-abandoned-cart',
        _type: 'pageSectionHero',
        campaignPreview: 'abandoned-cart',
        slot: {
          enabled: true,
          slotStyle: 'hero',
          label: 'Abandoned cart hero — Fiber recovery',
          campaignBrief: ref('brief-fiber-cart-recovery'),
          defaultPersona: 'new',
          staticFallback: {
            eyebrow: 'AT&T Fiber',
            headline: 'Your AT&T Fiber order is saved and ready when you are',
            subheadline: 'Pick up where you left off — complete your order in minutes.',
            ctaLabel: 'Complete my order',
            ctaUrl: 'https://www.att.com/internet/fiber/',
            ...bgFromMedia('att-fiber-hero', media.get('att-fiber-hero')),
          },
        },
      },
      {
        _key: 'banner-fiber',
        _type: 'pageSectionBanner',
        campaignPreview: 'trade-in',
        slots: [
          {
            _key: 'banner-fiber-slot',
            enabled: true,
            slotStyle: 'banner',
            label: 'Fiber banner',
            campaignBrief: ref('brief-fiber-cart-recovery'),
            defaultPersona: 'new',
            staticFallback: {
              eyebrow: 'AT&T Fiber',
              headline: 'Get 1 GIG speed for $50/mo.',
              subheadline:
                'For your first year. New customers only. Plus get a $200 reward card.',
              ctaLabel: 'Shop AT&T Fiber',
              ctaUrl: 'https://www.att.com/internet/fiber/',
            },
          },
        ],
      },
      {
        _key: 'feature-home-phone',
        _type: 'pageSectionFeatureGroup',
        sectionTitle: 'Great connections start here',
        block: {
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
          ...imageFromMedia('att-home-phone-feature', media.get('att-home-phone-feature')),
        },
      },
      {
        _key: 'resources-home-phone',
        _type: 'pageSectionResourceCards',
        section: {
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
              ...imageFromMedia(
                'att-home-phone-advanced-card',
                media.get('att-home-phone-advanced-card'),
              ),
            },
            {
              _key: 'resource-lifeline',
              title: 'AT&T Lifeline',
              description:
                'If you are in a qualifying household, you may be able to reduce your bill by getting a Lifeline benefit on your home phone service with AT&T.',
              ctaLabel: 'Learn more ›',
              ctaUrl: 'https://www.att.com/home-phone/lifeline/',
              ...imageFromMedia(
                'att-home-phone-lifeline-card',
                media.get('att-home-phone-lifeline-card'),
              ),
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
              ...imageFromMedia(
                'att-home-phone-helpful-card',
                media.get('att-home-phone-helpful-card'),
              ),
            },
          ],
        },
      },
      {
        _key: 'faq-fiber',
        _type: 'pageSectionFaq',
        section: {
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
        _key: 'promo-flex-band',
        _type: 'pageSectionPromoBand',
        cards: [
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
            ...imageFromMedia('att-iphone17-pro-card', media.get('att-iphone17-pro-card')),
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
            ...imageFromMedia('att-new-line-card', media.get('att-new-line-card')),
          },
        ],
      },
    ],
    footer: {
      linkGroups: [
        {
          title: 'Shop',
          links: [
            {label: 'Wireless', href: 'https://www.att.com/buy/phones/'},
            {label: 'Internet', href: 'https://www.att.com/internet/'},
            {label: 'Deals', href: 'https://www.att.com/deals/'},
          ],
        },
        {
          title: 'Support',
          links: [
            {label: 'Contact us', href: 'https://www.att.com/support/contact-us/'},
            {label: 'Find a store', href: 'https://www.att.com/stores/'},
            {label: 'Coverage map', href: 'https://www.att.com/maps/wireless-coverage.html'},
          ],
        },
        {
          title: 'About AT&T',
          links: [
            {label: 'About us', href: 'https://about.att.com/'},
            {label: 'Careers', href: 'https://about.att.com/careers/home/'},
            {label: 'Investors', href: 'https://investors.att.com/'},
          ],
        },
      ],
      legalText:
        'Demo storefront — layout inspired by att.com. Hero and banner slots resolve personalized copy from Sanity content releases.',
      copyright: '© AT&T Intellectual Property. Demo use only.',
    },
  }

  await client.createOrReplace(doc)
  console.log('[seedStorefrontHomepage] ✓ storefront-homepage created/updated')
  const wired = [...media.keys()].filter((k) => media.get(k))
  if (wired.length) {
    console.log(`[seedStorefrontHomepage]   images wired from ${wired.length} mediaAsset doc(s)`)
  } else {
    console.log(
      '[seedStorefrontHomepage]   no mediaAsset docs found — run importAttMediaToLibrary.ts then re-seed for images',
    )
  }
}

main().catch((err) => {
  console.error('[seedStorefrontHomepage] FAILED:', err)
  process.exit(1)
})
