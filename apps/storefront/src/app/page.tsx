import Link from 'next/link'
import {Suspense} from 'react'
import {sanityClient} from '@/sanity/client'
import {HOMEPAGE_QUERY} from '@/sanity/queries/homepage'
import {resolveHomepageSlot} from '@/lib/resolveHomepageSlot'
import {AttPromoBar} from '@/components/home/AttPromoBar'
import {AttHomeHero} from '@/components/home/AttHomeHero'
import {AttHomeBanner} from '@/components/home/AttHomeBanner'
import {AttPromoCardPersonalized, AttPromoCardStatic} from '@/components/home/AttPromoCard'
import {HomepagePersonaPicker} from '@/components/home/HomepagePersonaPicker'
import {AttFooter} from '@/components/home/AttFooter'
import {PERSONAS} from '@/lib/personas'
import type {PersonaKey} from '@/types'
import type {StorefrontHomepage} from '@/types/homepage'

export const revalidate = 60

const DEFAULT_HOMEPAGE: StorefrontHomepage = {
  _id: 'fallback',
  title: 'AT&T Homepage',
  promoBar: {
    enabled: true,
    message: 'Switch to AT&T and learn how to get up to $800/line to break your contract.',
    linkLabel: 'Shop now',
    linkUrl: 'https://www.att.com/',
  },
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
    },
  },
  promoGridTitle: 'Great connections start here',
  promoCards: [
    {
      badge: 'AT&T Fiber',
      title: 'Get 1 GIG speed for $50/mo.',
      description: 'For your first year. New customers only. Plus get a $200 reward card.',
      ctaLabel: 'Shop AT&T Fiber',
      ctaUrl: 'https://www.att.com/internet/fiber/',
      theme: 'fiber',
    },
    {
      badge: 'New & existing customers',
      title: 'Get $200 off per line',
      description:
        'When you call or order online and get an eligible wireless plan with a new phone line.',
      ctaLabel: 'Shop now',
      ctaUrl: 'https://www.att.com/deals/',
      theme: 'wireless',
    },
  ],
}

interface PageProps {
  searchParams: Promise<{persona?: string}>
}

function parsePersona(value: string | undefined): PersonaKey {
  if (value && value in PERSONAS) return value as PersonaKey
  return 'new'
}

export default async function HomePage({searchParams}: PageProps) {
  const {persona: personaParam} = await searchParams
  const persona = parsePersona(personaParam)

  const cms =
    (await sanityClient.fetch<StorefrontHomepage | null>(HOMEPAGE_QUERY, {})) ?? DEFAULT_HOMEPAGE

  const primaryHero = await resolveHomepageSlot(cms.primaryHero, persona)

  const banners = (
    await Promise.all((cms.personalizedBanners ?? []).map((b) => resolveHomepageSlot(b, persona)))
  ).filter(Boolean)

  const personalizedPromos = (
    await Promise.all(
      (cms.personalizedPromoSlots ?? []).map((s) => resolveHomepageSlot(s, persona)),
    )
  ).filter(Boolean)

  return (
    <div className="att-home">
      <AttPromoBar bar={cms.promoBar} />

      <Suspense fallback={null}>
        <div className="att-home__persona-wrap">
          <HomepagePersonaPicker active={persona} />
        </div>
      </Suspense>

      {primaryHero ? <AttHomeHero slot={primaryHero} /> : null}

      {banners.map((slot, i) =>
        slot ? <AttHomeBanner key={`banner-${i}`} slot={slot} /> : null,
      )}

      <section className="att-home__grid-section">
        <div className="att-home__grid-inner">
          <h2 className="att-home__grid-title">{cms.promoGridTitle ?? 'Great connections start here'}</h2>
          <div className="att-home__grid">
            {(cms.promoCards ?? []).map((card) => (
              <AttPromoCardStatic key={card._key ?? card.title} card={card} />
            ))}
            {personalizedPromos.map((slot, i) =>
              slot ? <AttPromoCardPersonalized key={`ps-${i}`} slot={slot} /> : null,
            )}
          </div>
        </div>
      </section>

      <section className="att-home__demo-note">
        <div className="att-home__demo-note-inner">
          <p>
            Switch persona above to see the hero and promo tiles swap to the matching published{' '}
            <code>web</code> variation.{' '}
            <Link href="/offers">Browse all personalized offers →</Link>
          </p>
        </div>
      </section>

      <AttFooter />
    </div>
  )
}
