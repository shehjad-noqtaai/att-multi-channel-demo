import type {HeroImage} from '@/types'

/** Merge project image asset and optional external CDN URL into HeroImage. */
export function mergeCmsImage(
  image?: HeroImage,
  externalUrl?: string,
  alt?: string,
): HeroImage | undefined {
  if (image?.url || image?.asset?._ref) {
    return {...image, alt: image.alt ?? alt}
  }
  if (externalUrl) {
    return {url: externalUrl, alt: alt ?? image?.alt}
  }
  return undefined
}
