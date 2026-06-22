import type {LegalNote} from '@/types/storefront'

export function AttLegalNote({note}: {note?: LegalNote | null}) {
  if (!note?.enabled || !note.text) return null

  return (
    <div className="att-legal-note" role="note">
      <div className="att-legal-note__inner">
        <p className="att-legal-note__text">
          {note.text}
          {note.linkLabel && note.linkUrl ? (
            <>
              {' '}
              <a href={note.linkUrl} className="att-legal-note__link">
                {note.linkLabel}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}
