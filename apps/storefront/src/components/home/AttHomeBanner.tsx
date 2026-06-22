import Link from 'next/link'
import type {CSSProperties} from 'react'
import type {ResolvedPersonalizedSlot} from '@/types/storefront'

export function AttHomeBanner({slot}: {slot: ResolvedPersonalizedSlot}) {
  const ctaHref =
    slot.ctaUrl ||
    (slot.briefSlug && slot.persona ? `/offer/${slot.briefSlug}/${slot.persona}` : undefined)

  return (
    <section
      className="att-banner"
      style={
        slot.brandColor
          ? ({['--slot-brand' as string]: slot.brandColor} as CSSProperties)
          : undefined
      }
    >
      <div className="att-banner__inner">
        <div className="att-banner__copy">
          {slot.isPersonalized ? (
            <span className="att-banner__badge">Personalized</span>
          ) : null}
          {slot.eyebrow ? <p className="att-banner__eyebrow">{slot.eyebrow}</p> : null}
          <h2 className="att-banner__headline">{slot.headline}</h2>
          {slot.subheadline ? <p className="att-banner__subheadline">{slot.subheadline}</p> : null}
        </div>
        <div className="att-banner__actions">
          {slot.ctaLabel && ctaHref ? (
            <a href={ctaHref} className="att-banner__cta">
              {slot.ctaLabel}
            </a>
          ) : null}
          {slot.briefSlug && slot.persona ? (
            <Link href={`/offer/${slot.briefSlug}/${slot.persona}`} className="att-banner__link">
              Details
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
