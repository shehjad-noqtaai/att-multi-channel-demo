import {urlForHero} from '@/sanity/image'
import {mergeCmsImage} from '@/lib/cmsImage'
import type {ResourceCard, ResourceSection} from '@/types/storefront'

function ResourceCard({card}: {card: ResourceCard}) {
  const src = urlForHero(
    mergeCmsImage(card.image, card.imageUrl, card.image?.alt),
    640,
  )
  const links = card.links?.filter((l) => l.label && l.href) ?? []
  const hasLinks = links.length > 0

  return (
    <article className="att-resource-card">
      <div className="att-resource-card__media">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={card.image?.alt ?? ''} className="att-resource-card__img" />
        ) : (
          <div className="att-resource-card__placeholder" aria-hidden />
        )}
      </div>
      <div className="att-resource-card__body">
        <h3 className="att-resource-card__title">{card.title}</h3>
        {hasLinks ? (
          <ul className="att-resource-card__links">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  href={link.href}
                  {...(link.openInNewTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : card.description ? (
          <p className="att-resource-card__desc">{card.description}</p>
        ) : null}
        {!hasLinks && card.ctaLabel && card.ctaUrl ? (
          <a href={card.ctaUrl} className="att-resource-card__cta">
            {card.ctaLabel}
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function AttResourceCards({section}: {section: ResourceSection}) {
  if (section.enabled === false || !section.title) return null
  const cards = section.cards?.filter((c) => c.title) ?? []
  if (!cards.length) return null

  return (
    <section className="att-resource-section">
      <div className="att-resource-section__inner">
        <h2 className="att-resource-section__title">{section.title}</h2>
        <div className="att-resource-section__grid">
          {cards.map((card, i) => (
            <ResourceCard key={card._key ?? `${card.title}-${i}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
