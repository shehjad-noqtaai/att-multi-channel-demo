import Link from 'next/link'

interface DisclaimerFooterProps {
  briefSlug: string
  persona: string
  brandTitle?: string | null
}

export function DisclaimerFooter({briefSlug, persona, brandTitle}: DisclaimerFooterProps) {
  return (
    <footer className="disclaimer-footer">
      <p className="disclaimer-footer__brandline">
        {brandTitle ? `A message for ${brandTitle} customers.` : 'Personalized offer.'}{' '}
        Standard message and data rates may apply.
      </p>
      <p>
        <Link href={`/offer/${briefSlug}/${persona}/terms`} className="disclaimer-footer__terms">
          See full terms
        </Link>
      </p>
    </footer>
  )
}
