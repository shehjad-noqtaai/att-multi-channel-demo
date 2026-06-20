import Link from 'next/link'
import type {TermsData} from '../types'

interface TermsViewProps {
  briefSlug: string
  persona: string
  data: TermsData
}

export function TermsView({briefSlug, persona, data}: TermsViewProps) {
  const briefDisclaimers = data.mandatoryDisclaimers ?? []
  const personaDisclaimers = data.persona?.brandDisclaimers ?? []
  return (
    <article className="terms">
      <header className="terms__header">
        <Link href={`/offer/${briefSlug}/${persona}`} className="terms__back">
          ← Back to offer
        </Link>
        <h1 className="terms__title">{data.title ?? 'Offer terms'}</h1>
        {data.offer ? <p className="terms__offer">{data.offer}</p> : null}
      </header>

      {briefDisclaimers.length > 0 ? (
        <section className="terms__section">
          <h2 className="terms__h2">Offer terms</h2>
          <ul className="terms__list">
            {briefDisclaimers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {personaDisclaimers.length > 0 ? (
        <section className="terms__section">
          <h2 className="terms__h2">
            {data.persona?.title ? `${data.persona.title} terms` : 'Audience terms'}
          </h2>
          <ul className="terms__list">
            {personaDisclaimers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {briefDisclaimers.length === 0 && personaDisclaimers.length === 0 ? (
        <p className="terms__empty">No additional terms apply to this offer.</p>
      ) : null}
    </article>
  )
}
