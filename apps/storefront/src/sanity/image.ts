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
