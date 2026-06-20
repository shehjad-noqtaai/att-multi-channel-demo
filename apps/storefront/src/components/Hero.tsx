import {urlForHero} from '../sanity/image'
import type {HeroImage} from '../types'

interface HeroProps {
  image?: HeroImage
  headline: string
  subheadline?: string
  logoUrl?: string | null
  brandTitle?: string | null
}

/**
 * Hero — image + headline + subheadline. Uses plain <img> (no next/image) to
 * skip remotePatterns allowlisting for the demo. Mirrors the Studio
 * HeroChannelPreview heuristic for src selection (see sanity/image.ts).
 */
export function Hero({image, headline, subheadline, logoUrl, brandTitle}: HeroProps) {
  const src = urlForHero(image, 1600)
  return (
    <section className="hero">
      {src ? (
        <div className="hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={image?.alt ?? ''} className="hero__img" />
        </div>
      ) : (
        <div className="hero__media hero__media--placeholder" aria-hidden />
      )}
      <div className="hero__overlay">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={brandTitle ?? ''} className="hero__logo" />
        ) : null}
        <h1 className="hero__headline">{headline}</h1>
        {subheadline ? <p className="hero__subheadline">{subheadline}</p> : null}
      </div>
    </section>
  )
}
