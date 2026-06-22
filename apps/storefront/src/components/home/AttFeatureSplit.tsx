import {urlForHeroSplit} from '@/sanity/image'
import {mergeCmsImage} from '@/lib/cmsImage'
import type {FeatureBlock} from '@/types/storefront'

export function AttFeatureSplit({block}: {block: FeatureBlock}) {
  if (!block.enabled || !block.title) return null

  const src = urlForHeroSplit(
    mergeCmsImage(block.image, block.imageUrl, block.image?.alt),
    1080,
    900,
  )
  const bullets = block.bullets?.filter(Boolean) ?? []

  return (
    <article className="att-feature-split">
      <div className="att-feature-split__shell">
        <div className="att-feature-split__panel">
          <div className="att-feature-split__copy">
            {block.eyebrow ? <p className="att-feature-split__eyebrow">{block.eyebrow}</p> : null}
            <h2 className="att-feature-split__title">{block.title}</h2>
            {block.description ? (
              <p className="att-feature-split__desc">{block.description}</p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="att-feature-split__bullets">
                {bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {block.legalNote ? <p className="att-feature-split__legal">{block.legalNote}</p> : null}
            {block.ctaLabel && block.ctaUrl ? (
              <a href={block.ctaUrl} className="att-feature-split__cta">
                {block.ctaLabel}
              </a>
            ) : null}
          </div>
          <div className="att-feature-split__media">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={block.image?.alt ?? ''} className="att-feature-split__img" />
            ) : (
              <div className="att-feature-split__placeholder" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
