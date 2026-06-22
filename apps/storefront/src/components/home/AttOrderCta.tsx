import type {OrderCta} from '@/types/storefront'

const DEFAULT: OrderCta = {
  enabled: true,
  phoneLabel: 'ORDER NOW',
  phoneNumber: '844-249-5043',
  phoneHref: 'tel:+18442495043',
}

export function AttOrderCta({cta}: {cta?: OrderCta | null}) {
  const data = cta ?? DEFAULT
  if (!data.enabled || !data.phoneNumber) return null

  const href = data.phoneHref ?? `tel:${data.phoneNumber.replace(/\D/g, '')}`

  return (
    <div className="att-order-cta" role="region" aria-label="Order by phone">
      <a href={href} className="att-order-cta__phone">
        <span className="att-order-cta__label">{data.phoneLabel ?? 'ORDER NOW'}</span>
        <span className="att-order-cta__number">{data.phoneNumber}</span>
      </a>
    </div>
  )
}
