import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityClient} from '@/sanity/client'
import {WEB_VARIATION_QUERY, OFFER_INDEX_QUERY} from '@/sanity/queries'
import {mergeText} from '@/sanity/tokens'
import {mergeBlocks} from '@/lib/portableText'
import {getPersona} from '@/lib/personas'
import {BrandShell} from '@/components/BrandShell'
import {Hero} from '@/components/Hero'
import {OfferBody} from '@/components/OfferBody'
import {Cta} from '@/components/Cta'
import {PersonaSwitcher} from '@/components/PersonaSwitcher'
import {DisclaimerFooter} from '@/components/DisclaimerFooter'
import type {OfferIndexEntry, PersonaKey, WebVariation} from '@/types'

export const revalidate = 60

interface RouteParams {
  brief: string
  persona: string
}

interface PageProps {
  params: Promise<RouteParams>
}

async function loadVariation(brief: string, persona: string): Promise<WebVariation | null> {
  const preferredFlowStep = brief === 'att-fiber-order-recovery' ? 'reminder' : 'default'
  return sanityClient.fetch<WebVariation | null>(WEB_VARIATION_QUERY, {
    brief,
    persona,
    preferredFlowStep,
  })
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {brief, persona} = await params
  const v = await loadVariation(brief, persona)
  if (!v?.web?.headline) {
    return {title: 'Offer'}
  }
  // Tokens may not be fully resolvable at metadata time, but mergeText is safe
  // (unresolved tokens are left as {{key}}).
  const headline = await mergeText(v.web.headline, v.brief, v.mergeFields ?? [])
  return {title: headline}
}

export async function generateStaticParams() {
  // Pre-render every brief × available-persona combination from the published
  // offer index. Anything missing is a 404 (intentional).
  try {
    const offers =
      (await sanityClient.fetch<OfferIndexEntry[]>(OFFER_INDEX_QUERY, {})) ?? []
    const out: Array<{brief: string; persona: string}> = []
    for (const o of offers) {
      for (const p of o.personas) {
        out.push({brief: o.slug, persona: p})
      }
    }
    return out
  } catch {
    return []
  }
}

export default async function OfferPage({params}: PageProps) {
  const {brief, persona} = await params

  const variation = await loadVariation(brief, persona)
  if (!variation || !variation.web) {
    notFound()
  }

  const {web, brief: briefDoc, mergeFields, config} = variation
  const brandColor = config?.brandColor

  // Pre-resolve every {{token}} on the server before render. PT serializers
  // are sync, so blocks must be merged ahead of time.
  const [headline, subheadline, ctaLabel, mergedBlocks] = await Promise.all([
    mergeText(web.headline, briefDoc, mergeFields),
    mergeText(web.subheadline, briefDoc, mergeFields),
    mergeText(web.ctaLabel, briefDoc, mergeFields),
    mergeBlocks(web.body, briefDoc, mergeFields),
  ])

  // Also merge the CTA URL (it may legitimately be a token like
  // {{cart.recoveryUrl}} for the abandoned-cart brief).
  const ctaUrl = web.ctaUrl ? await mergeText(web.ctaUrl, briefDoc, mergeFields) : undefined

  // Build the persona switcher options from the offer index (so we only show
  // pills that actually resolve).
  const offers =
    (await sanityClient.fetch<OfferIndexEntry[]>(OFFER_INDEX_QUERY, {})) ?? []
  const myOffer = offers.find((o) => o.slug === brief)
  const availablePersonas = myOffer?.personas ?? [persona]
  const briefList = offers.map((o) => ({slug: o.slug, title: o.title}))

  const personaKey: PersonaKey = (getPersona(persona)?.key ?? 'new') as PersonaKey

  return (
    <BrandShell brandColor={brandColor}>
      <div className="page">
        <PersonaSwitcher
          briefSlug={brief}
          activePersona={personaKey}
          available={availablePersonas}
          briefs={briefList}
        />

        <Hero
          image={web.heroImage}
          headline={headline}
          subheadline={subheadline}
          logoUrl={config?.logoUrl}
          brandTitle={config?.title}
        />

        <OfferBody blocks={mergedBlocks} />

        {ctaLabel ? <Cta label={ctaLabel} href={ctaUrl} /> : null}

        <DisclaimerFooter
          briefSlug={brief}
          persona={persona}
          brandTitle={config?.title}
        />
      </div>
    </BrandShell>
  )
}
