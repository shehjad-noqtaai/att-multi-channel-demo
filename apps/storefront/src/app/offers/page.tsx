import Link from 'next/link'
import {sanityClient} from '@/sanity/client'
import {OFFER_INDEX_QUERY} from '@/sanity/queries'
import {PERSONAS, getPersona} from '@/lib/personas'
import type {OfferIndexEntry} from '@/types'

export const revalidate = 60

export default async function OffersGalleryPage() {
  const offers = (await sanityClient.fetch<OfferIndexEntry[]>(OFFER_INDEX_QUERY, {})) ?? []

  return (
    <div className="page page--wide">
      <header className="gallery__intro">
        <h1>Personalized offers</h1>
        <p>
          Pick an offer and a persona to see how the same campaign brief is rendered for different
          audiences.
        </p>
      </header>

      {offers.length === 0 ? (
        <p style={{color: 'var(--color-muted)'}}>
          No published offers yet. Generate variations in the Studio and publish the release to see
          them here.
        </p>
      ) : (
        <div className="gallery__grid">
          {offers.map((o) => {
            const firstPersona = o.personas[0]
            const accent =
              (firstPersona && getPersona(firstPersona)?.brandColor) || PERSONAS.new.brandColor
            return (
              <article
                key={o._id}
                className="gallery-card"
                style={{['--brand-primary' as string]: accent}}
              >
                <div className="gallery-card__accent" />
                <h2 className="gallery-card__title">{o.title}</h2>
                {o.offer ? <p className="gallery-card__offer">{o.offer}</p> : null}
                <div className="gallery-card__personas">
                  {o.personas.map((p) => {
                    const meta = getPersona(p)
                    if (!meta) return null
                    return (
                      <Link
                        key={p}
                        href={`/offer/${o.slug}/${meta.key}`}
                        className="persona-pill"
                        style={{borderColor: meta.brandColor, color: meta.brandColor}}
                      >
                        {meta.title}
                      </Link>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
