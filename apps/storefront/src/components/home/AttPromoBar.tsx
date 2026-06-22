import type {PromoBar} from '@/types/storefront'

export function AttPromoBar({bar}: {bar?: PromoBar}) {
  if (!bar?.enabled || !bar.message) return null

  return (
    <div className="att-promo-bar" role="region" aria-label="Promotion">
      <div className="att-promo-bar__inner">
        <p className="att-promo-bar__text">
          <strong>{bar.message}</strong>
          {bar.linkLabel && bar.linkUrl ? (
            <>
              {' '}
              <a href={bar.linkUrl} className="att-promo-bar__link">
                {bar.linkLabel}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}
