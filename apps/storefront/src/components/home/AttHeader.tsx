import Link from 'next/link'
import {urlForHero} from '@/sanity/image'
import {mergeCmsImage} from '@/lib/cmsImage'
import type {SiteHeader, NavLink} from '@/types/storefront'

function NavAnchor({link, className}: {link: NavLink; className?: string}) {
  if (!link.label || !link.href) return null
  const props = {
    className,
    href: link.href,
    ...(link.openInNewTab ? {target: '_blank' as const, rel: 'noopener noreferrer'} : {}),
  }
  if (link.href.startsWith('/')) {
    return <Link {...props}>{link.label}</Link>
  }
  return <a {...props}>{link.label}</a>
}

const DEFAULT_HEADER: SiteHeader = {
  utilityLinks: [
    {label: 'Personal', href: '/', openInNewTab: false},
    {label: 'Business', href: 'https://www.att.com/business/', openInNewTab: true},
    {label: 'Find a store', href: 'https://www.att.com/stores/', openInNewTab: true},
  ],
  logoText: 'AT&T',
  primaryNav: [
    {label: 'Shop', href: 'https://www.att.com/shop/'},
    {label: 'Deals', href: 'https://www.att.com/deals/'},
    {label: 'AT&T Difference', href: 'https://www.att.com/why-att/'},
    {label: 'Support', href: 'https://www.att.com/support/'},
  ],
  actionLink: {label: 'Personalized offers', href: '/offers'},
}

export function AttHeader({header}: {header?: SiteHeader | null}) {
  const data = header ?? DEFAULT_HEADER
  const logoSrc = urlForHero(
    mergeCmsImage(data.logoImage, data.logoImageUrl, data.logoImage?.alt ?? 'AT&T'),
    120,
  )
  const utility = data.utilityLinks ?? []
  const nav = data.primaryNav ?? []

  return (
    <header className="att-header">
      {utility.length > 0 ? (
        <div className="att-header__utility">
          <div className="att-header__utility-inner">
            <span className="att-header__utility-links">
              {utility.slice(0, 2).map((link) => (
                <NavAnchor key={link.label} link={link} />
              ))}
            </span>
            <span className="att-header__utility-links">
              {utility.slice(2).map((link) => (
                <NavAnchor key={link.label} link={link} />
              ))}
            </span>
          </div>
        </div>
      ) : null}
      <div className="att-header__main">
        <div className="att-header__main-inner">
          <Link href="/" className="att-header__logo" aria-label="AT&T home">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt={data.logoImage?.alt ?? 'AT&T'} className="att-header__logo-img" />
            ) : (
              data.logoText ?? 'AT&T'
            )}
          </Link>
          <nav className="att-header__nav" aria-label="Primary">
            {nav.map((item) => (
              <NavAnchor key={item.label} link={item} className="att-header__nav-link" />
            ))}
          </nav>
          {data.actionLink ? (
            <div className="att-header__actions">
              <NavAnchor link={data.actionLink} className="att-header__offers-link" />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
