import {createImageUrlBuilder} from '@sanity/image-url'
import {sanityClient} from './client'
import type {HeroImage} from '../types'

const builder = createImageUrlBuilder(sanityClient)

/**
 * urlForHero — mirrors the Studio HeroChannelPreview pattern.
 *
 * `heroImage.url` (Media Library asset) is preferred: append a sized
 * `?w=...&fit=crop&auto=format` query for an optimized CDN delivery.
 * Otherwise build from `heroImage.asset._ref` via @sanity/image-url.
 * Returns undefined when neither source is present.
 */
export function urlForHero(heroImage: HeroImage | undefined, width = 1280): string | undefined {
  if (!heroImage) return undefined
  if (heroImage.url) {
    return `${heroImage.url}?w=${width}&fit=crop&auto=format`
  }
  if (heroImage.asset?._ref) {
    try {
      return builder.image(heroImage).width(width).fit('crop').auto('format').url()
    } catch {
      return undefined
    }
  }
  return undefined
}

/** Split-layout hero — att.com-style ~6:5 crop with rounded frame. */
export function urlForHeroSplit(
  heroImage: HeroImage | undefined,
  width = 960,
  height = 800,
): string | undefined {
  if (!heroImage) return undefined
  if (heroImage.url) {
    const sep = heroImage.url.includes('?') ? '&' : '?'
    return `${heroImage.url}${sep}w=${width}&h=${height}&fit=crop&crop=center&auto=format`
  }
  if (heroImage.asset?._ref) {
    try {
      return builder
        .image(heroImage)
        .width(width)
        .height(height)
        .fit('crop')
        .auto('format')
        .url()
    } catch {
      return undefined
    }
  }
  return undefined
}
