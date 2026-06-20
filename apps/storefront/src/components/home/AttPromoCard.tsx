import Link from 'next/link'
import type {CSSProperties} from 'react'
import {urlForHero} from '@/sanity/image'
import type {HomepagePromoCard} from '@/types/homepage'
import type {ResolvedHomepageSlot} from '@/types/homepage'

export function AttPromoCardStatic({card}: {card: HomepagePromoCard}) {
  const src = urlForHero(card.image, 640)
  return (
    <article className={`att-promo-card att-promo-card--${card.theme ?? 'att'}`}>
      {src ? (
        <div className="att-promo-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={card.image?.alt ?? ''} />
        </div>
      ) : null}
      <div className="att-promo-card__body">
        {card.badge ? <p className="att-promo-card__badge">{card.badge}</p> : null}
        <h3 className="att-promo-card__title">{card.title}</h3>
        {card.description ? <p className="att-promo-card__desc">{card.description}</p> : null}
        {card.ctaLabel && card.ctaUrl ? (
          <a href={card.ctaUrl} className="att-promo-card__cta">
            {card.ctaLabel}
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function AttPromoCardPersonalized({slot}: {slot: ResolvedHomepageSlot}) {
  const ctaHref =
    slot.ctaUrl ||
    (slot.briefSlug && slot.persona ? `/offer/${slot.briefSlug}/${slot.persona}` : undefined)
  const src = urlForHero(slot.heroImage, 640)

  return (
    <article
      className="att-promo-card att-promo-card--att att-promo-card--personalized"
      style={
        slot.brandColor
          ? ({['--slot-brand' as string]: slot.brandColor} as CSSProperties)
          : undefined
      }
    >
      {src ? (
        <div className="att-promo-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={slot.heroImage?.alt ?? ''} />
        </div>
      ) : null}
      <div className="att-promo-card__body">
        <p className="att-promo-card__badge">
          {slot.isPersonalized ? 'Personalized · ' : ''}
          {slot.eyebrow ?? 'Offer'}
        </p>
        <h3 className="att-promo-card__title">{slot.headline}</h3>
        {slot.subheadline ? <p className="att-promo-card__desc">{slot.subheadline}</p> : null}
        {slot.ctaLabel && ctaHref ? (
          <Link href={ctaHref} className="att-promo-card__cta">
            {slot.ctaLabel}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
