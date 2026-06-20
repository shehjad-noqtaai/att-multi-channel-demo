// studio/scripts/seedStorefrontHomepage.ts
//
// Idempotent seed for the storefront homepage singleton (att.com-style shell +
// personalized hero wired to the iPhone trade-in brief).
//
//   set -a; . studio/.env; set +a; npx tsx studio/scripts/seedStorefrontHomepage.ts

import {createClient} from '@sanity/client'

const ref = (id: string) => ({_type: 'reference', _ref: id})

async function main() {
  const token = process.env.SANITY_AUTH_TOKEN
  if (!token) throw new Error('SANITY_AUTH_TOKEN env var required')

  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'z6s0fz61',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    token,
    useCdn: false,
    apiVersion: '2024-10-01',
  })

  const doc = {
    _id: 'storefront-homepage',
    _type: 'storefrontHomepage',
    title: 'AT&T Homepage',
    promoBar: {
      enabled: true,
      message:
        'Switch to AT&T and learn how to get up to $800/line to break your contract.',
      linkLabel: 'Shop now',
      linkUrl: 'https://www.att.com/',
    },
    primaryHero: {
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
      },
    },
    personalizedBanners: [
      {
        _key: 'banner-fiber',
        enabled: true,
        slotStyle: 'banner',
        label: 'Fiber banner',
        campaignBrief: ref('brief-fiber-cart-recovery'),
        defaultPersona: 'new',
        staticFallback: {
          eyebrow: 'AT&T Fiber',
          headline: 'Get 1 GIG speed for $50/mo.',
          subheadline: 'For your first year. New customers only. Plus get a $200 reward card.',
          ctaLabel: 'Shop AT&T Fiber',
          ctaUrl: 'https://www.att.com/internet/fiber/',
        },
      },
    ],
    promoGridTitle: 'Great connections start here',
    promoCards: [
      {
        _key: 'card-fiber',
        badge: 'AT&T Fiber',
        title: 'Get 1 GIG speed for $50/mo.',
        description:
          'For your first year. New customers only. Plus get a $200 reward card.',
        ctaLabel: 'Shop AT&T Fiber',
        ctaUrl: 'https://www.att.com/internet/fiber/',
        theme: 'fiber',
      },
      {
        _key: 'card-wireless',
        badge: 'New & existing customers',
        title: 'Get $200 off per line',
        description:
          'When you call or order online and get an eligible wireless plan with a new phone line.',
        ctaLabel: 'Shop now',
        ctaUrl: 'https://www.att.com/deals/',
        theme: 'wireless',
      },
    ],
    personalizedPromoSlots: [
      {
        _key: 'promo-iphone',
        enabled: true,
        slotStyle: 'promo',
        label: 'iPhone promo tile',
        campaignBrief: ref('brief-iphone17-tradein'),
        defaultPersona: 'loyal',
        staticFallback: {
          eyebrow: 'New & existing customers',
          headline: 'Get iPhone 17 Pro for $0',
          subheadline: 'Learn how to get this offer with eligible trade-in.',
          ctaLabel: 'Shop now',
          ctaUrl: 'https://www.att.com/',
        },
      },
    ],
  }

  await client.createOrReplace(doc)
  console.log('[seedStorefrontHomepage] ✓ storefront-homepage created/updated')
}

main().catch((err) => {
  console.error('[seedStorefrontHomepage] FAILED:', err)
  process.exit(1)
})
