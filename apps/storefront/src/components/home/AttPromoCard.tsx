import Link from 'next/link'
import type {CSSProperties} from 'react'
import {urlForHero} from '@/sanity/image'
import {mergeCmsImage} from '@/lib/cmsImage'
import type {PromoCard} from '@/types/storefront'
import type {ResolvedPersonalizedSlot} from '@/types/storefront'

function isFlexCard(card: PromoCard) {
  return card.layout === 'flex' || (card.layout !== 'stack' && card.theme !== 'fiber')
}

function PromoLegal({card}: {card: PromoCard}) {
  if (!card.legalNote && !card.legalLinkLabel) return null
  return (
    <p className="att-promo-card__legal">
      {card.legalNote}
      {card.legalLinkLabel && card.legalLinkUrl ? (
        <>
          {card.legalNote ? ' ' : null}
          <a href={card.legalLinkUrl}>{card.legalLinkLabel}</a>
        </>
      ) : null}
    </p>
  )
}

function PromoActions({
  ctaLabel,
  ctaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  flex,
}: {
  ctaLabel?: string
  ctaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  flex?: boolean
}) {
  if (!ctaLabel || !ctaUrl) return null
  return (
    <div className="att-promo-card__actions">
      <a href={ctaUrl} className={flex ? 'att-promo-card__cta-pill' : 'att-promo-card__cta'}>
        {ctaLabel}
      </a>
      {secondaryCtaLabel && secondaryCtaUrl ? (
        <a href={secondaryCtaUrl} className="att-promo-card__secondary-cta">
          {secondaryCtaLabel}
        </a>
      ) : null}
    </div>
  )
}

export function AttPromoCardStatic({card}: {card: PromoCard}) {
  const src = urlForHero(mergeCmsImage(card.image, card.imageUrl, card.image?.alt), 720)
  const flex = isFlexCard(card)

  if (flex) {
    return (
      <article className="att-promo-card att-promo-card--flex">
        <div className="att-promo-card__flex-inner">
          <div className="att-promo-card__body">
            {card.badge ? <p className="att-promo-card__badge">{card.badge}</p> : null}
            <h3 className="att-promo-card__title">{card.title}</h3>
            {card.description ? <p className="att-promo-card__desc">{card.description}</p> : null}
            <PromoLegal card={card} />
            <PromoActions
              flex
              ctaLabel={card.ctaLabel}
              ctaUrl={card.ctaUrl}
              secondaryCtaLabel={card.secondaryCtaLabel}
              secondaryCtaUrl={card.secondaryCtaUrl}
            />
          </div>
          {src ? (
            <div className="att-promo-card__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={card.image?.alt ?? ''} />
            </div>
          ) : null}
        </div>
      </article>
    )
  }

  return (
    <article className={`att-promo-card att-promo-card--stack att-promo-card--${card.theme ?? 'att'}`}>
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
        <PromoLegal card={card} />
        <PromoActions ctaLabel={card.ctaLabel} ctaUrl={card.ctaUrl} />
      </div>
    </article>
  )
}

export function AttPromoCardPersonalized({slot}: {slot: ResolvedPersonalizedSlot}) {
  const ctaHref =
    slot.ctaUrl ||
    (slot.briefSlug && slot.persona ? `/offer/${slot.briefSlug}/${slot.persona}` : undefined)
  const src = urlForHero(slot.heroImage, 720)

  return (
    <article
      className="att-promo-card att-promo-card--flex att-promo-card--personalized"
      style={
        slot.brandColor
          ? ({['--slot-brand' as string]: slot.brandColor} as CSSProperties)
          : undefined
      }
    >
      <div className="att-promo-card__flex-inner">
        <div className="att-promo-card__body">
          <p className="att-promo-card__badge">
            {slot.isPersonalized ? 'Personalized · ' : ''}
            {slot.eyebrow ?? 'Offer'}
          </p>
          <h3 className="att-promo-card__title">{slot.headline}</h3>
          {slot.subheadline ? <p className="att-promo-card__desc">{slot.subheadline}</p> : null}
          {slot.ctaLabel && ctaHref ? (
            <Link href={ctaHref} className="att-promo-card__cta-pill">
              {slot.ctaLabel}
            </Link>
          ) : null}
        </div>
        {src ? (
          <div className="att-promo-card__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={slot.heroImage?.alt ?? ''} />
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function isFlexPromoCard(card: PromoCard) {
  return isFlexCard(card)
}
