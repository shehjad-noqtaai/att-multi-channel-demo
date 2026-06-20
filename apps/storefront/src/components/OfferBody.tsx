import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '../types'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="prose__p">{children}</p>,
    h2: ({children}) => <h2 className="prose__h2">{children}</h2>,
    h3: ({children}) => <h3 className="prose__h3">{children}</h3>,
    blockquote: ({children}) => <blockquote className="prose__quote">{children}</blockquote>,
  },
  list: {
    bullet: ({children}) => <ul className="prose__ul">{children}</ul>,
    number: ({children}) => <ol className="prose__ol">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li className="prose__li">{children}</li>,
    number: ({children}) => <li className="prose__li">{children}</li>,
  },
  marks: {
    strong: ({children}) => <strong className="prose__strong">{children}</strong>,
    em: ({children}) => <em className="prose__em">{children}</em>,
    link: ({value, children}) => {
      const href = (value as {href?: string} | undefined)?.href ?? '#'
      const external = /^https?:\/\//.test(href)
      return (
        <a
          className="prose__link"
          href={href}
          {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        >
          {children}
        </a>
      )
    },
  },
}

interface OfferBodyProps {
  /** Blocks must already have tokens resolved (use mergeBlocks first). */
  blocks: PortableTextBlock[]
}

export function OfferBody({blocks}: OfferBodyProps) {
  if (!blocks || blocks.length === 0) return null
  return (
    <div className="prose">
      <PortableText value={blocks} components={components} />
    </div>
  )
}
