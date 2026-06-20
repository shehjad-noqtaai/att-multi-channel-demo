import Link from 'next/link'
import type {CSSProperties} from 'react'
import {urlForHero} from '@/sanity/image'
import type {ResolvedHomepageSlot} from '@/types/homepage'

interface AttHomeHeroProps {
  slot: ResolvedHomepageSlot
}

export function AttHomeHero({slot}: AttHomeHeroProps) {
  const src = urlForHero(slot.heroImage, 1920)
  const ctaHref =
    slot.ctaUrl ||
    (slot.briefSlug && slot.persona ? `/offer/${slot.briefSlug}/${slot.persona}` : undefined)

  return (
    <section
      className="att-hero"
      style={
        slot.brandColor
          ? ({['--slot-brand' as string]: slot.brandColor} as CSSProperties)
          : undefined
      }
    >
      <div className="att-hero__media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={slot.heroImage?.alt ?? ''} className="att-hero__img" />
        ) : (
          <div className="att-hero__placeholder" aria-hidden />
        )}
      </div>
      <div className="att-hero__content">
        <div className="att-hero__content-inner">
          {slot.isPersonalized ? (
            <span className="att-hero__badge">Personalized for you</span>
          ) : null}
          {slot.eyebrow ? <p className="att-hero__eyebrow">{slot.eyebrow}</p> : null}
          <h1 className="att-hero__headline">{slot.headline}</h1>
          {slot.subheadline ? <p className="att-hero__subheadline">{slot.subheadline}</p> : null}
          {slot.ctaLabel && ctaHref ? (
            <a href={ctaHref} className="att-hero__cta">
              {slot.ctaLabel}
            </a>
          ) : null}
          {slot.briefSlug && slot.persona ? (
            <Link
              href={`/offer/${slot.briefSlug}/${slot.persona}`}
              className="att-hero__details-link"
            >
              View full offer details
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
