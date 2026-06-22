import {sanityClient} from '@/sanity/client'
import {WEB_VARIATION_QUERY} from '@/sanity/queries'
import {mergeText} from '@/sanity/tokens'
import {urlForHero} from '@/sanity/image'
import {getPersona} from '@/lib/personas'
import {mergeCmsImage} from '@/lib/cmsImage'
import type {
  PersonalizedSlot,
  StaticHero,
  ResolvedPersonalizedSlot,
} from '@/types/storefront'
import type {PersonaKey, WebVariation} from '@/types'

function staticImageUrl(fallback?: StaticHero): string | undefined {
  if (!fallback) return undefined
  const img = mergeCmsImage(
    fallback.backgroundImage,
    fallback.backgroundImageUrl,
    fallback.backgroundImage?.alt,
  )
  if (!img) return undefined
  return urlForHero(img, 1600)
}

function fromStatic(
  slot: PersonalizedSlot,
  fallback?: StaticHero,
): ResolvedPersonalizedSlot | null {
  if (!fallback?.headline) return null
  const heroImage = mergeCmsImage(
    fallback.backgroundImage,
    fallback.backgroundImageUrl,
    fallback.backgroundImage?.alt,
  )
  return {
    slotStyle: slot.slotStyle ?? 'hero',
    eyebrow: fallback.eyebrow,
    headline: fallback.headline,
    subheadline: fallback.subheadline,
    ctaLabel: fallback.ctaLabel,
    ctaUrl: fallback.ctaUrl,
    heroImage,
    isPersonalized: false,
    persona: (slot.defaultPersona as PersonaKey) ?? 'new',
  }
}

async function fromVariation(
  slot: PersonalizedSlot,
  variation: WebVariation,
  persona: PersonaKey,
): Promise<ResolvedPersonalizedSlot | null> {
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
export async function resolvePersonalizedSlot(
  slot: PersonalizedSlot | undefined | null,
  persona: PersonaKey,
  options?: {preferredFlowStep?: string},
): Promise<ResolvedPersonalizedSlot | null> {
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
