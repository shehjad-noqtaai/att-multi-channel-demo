import {sanityClient} from '@/sanity/client'
import {WEB_VARIATION_QUERY} from '@/sanity/queries'
import {mergeText} from '@/sanity/tokens'
import {urlForHero} from '@/sanity/image'
import {getPersona} from '@/lib/personas'
import type {
  HomepagePersonalizedSlot,
  HomepageStaticHero,
  ResolvedHomepageSlot,
} from '@/types/homepage'
import type {PersonaKey, WebVariation} from '@/types'

function staticImageUrl(fallback?: HomepageStaticHero): string | undefined {
  if (!fallback?.backgroundImage) return undefined
  return urlForHero(fallback.backgroundImage, 1600)
}

function fromStatic(
  slot: HomepagePersonalizedSlot,
  fallback?: HomepageStaticHero,
): ResolvedHomepageSlot | null {
  if (!fallback?.headline) return null
  return {
    slotStyle: slot.slotStyle ?? 'hero',
    eyebrow: fallback.eyebrow,
    headline: fallback.headline,
    subheadline: fallback.subheadline,
    ctaLabel: fallback.ctaLabel,
    ctaUrl: fallback.ctaUrl,
    heroImage: fallback.backgroundImage,
    isPersonalized: false,
    persona: (slot.defaultPersona as PersonaKey) ?? 'new',
  }
}

async function fromVariation(
  slot: HomepagePersonalizedSlot,
  variation: WebVariation,
  persona: PersonaKey,
): Promise<ResolvedHomepageSlot | null> {
  const {web, brief, config, mergeFields} = variation
  if (!web?.headline) return null

  const [headline, subheadline, ctaLabel, ctaUrl] = await Promise.all([
    mergeText(web.headline, brief, mergeFields),
    mergeText(web.subheadline, brief, mergeFields),
    mergeText(web.ctaLabel, brief, mergeFields),
    web.ctaUrl ? mergeText(web.ctaUrl, brief, mergeFields) : Promise.resolve(undefined),
  ])

  return {
    slotStyle: slot.slotStyle ?? 'hero',
    eyebrow: slot.staticFallback?.eyebrow ?? config?.title ?? getPersona(persona)?.title,
    headline,
    subheadline,
    ctaLabel,
    ctaUrl,
    heroImage: web.heroImage,
    brandColor: config?.brandColor,
    logoUrl: config?.logoUrl,
    brandTitle: config?.title,
    briefSlug: brief.slug,
    persona,
    isPersonalized: true,
    body: web.body,
    segment: config,
  }
}

/** Resolve a homepage slot: published web variation for (brief, persona) or CMS fallback. */
export async function resolveHomepageSlot(
  slot: HomepagePersonalizedSlot | undefined | null,
  persona: PersonaKey,
  options?: {preferredFlowStep?: string},
): Promise<ResolvedHomepageSlot | null> {
  if (!slot?.enabled) return null

  const briefSlug = slot.campaignBrief?.slug
  if (briefSlug) {
    const preferredFlowStep =
      options?.preferredFlowStep ?? (slot.campaignBrief?.multiStep ? 'reminder' : 'default')

    const variation = await sanityClient.fetch<WebVariation | null>(WEB_VARIATION_QUERY, {
      brief: briefSlug,
      persona,
      preferredFlowStep,
    })
    if (variation?.web) {
      const resolved = await fromVariation(slot, variation, persona)
      if (resolved) return resolved
    }
  }

  return fromStatic(slot, slot.staticFallback)
}

export {staticImageUrl}
