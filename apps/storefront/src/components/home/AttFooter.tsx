import type {SiteFooter, NavLink} from '@/types/storefront'

function FooterLink({link}: {link: NavLink}) {
  if (!link.label || !link.href) return null
  const props = {
    href: link.href,
    className: 'att-footer__link',
    ...(link.openInNewTab ? {target: '_blank' as const, rel: 'noopener noreferrer'} : {}),
  }
  return <a {...props}>{link.label}</a>
}

const DEFAULT_FOOTER: SiteFooter = {
  linkGroups: [
    {
      title: 'Shop',
      links: [
        {label: 'Wireless', href: 'https://www.att.com/buy/phones/'},
        {label: 'Internet', href: 'https://www.att.com/internet/'},
        {label: 'Deals', href: 'https://www.att.com/deals/'},
      ],
    },
    {
      title: 'Support',
      links: [
        {label: 'Contact us', href: 'https://www.att.com/support/contact-us/'},
        {label: 'Find a store', href: 'https://www.att.com/stores/'},
        {label: 'Coverage map', href: 'https://www.att.com/maps/wireless-coverage.html'},
      ],
    },
    {
      title: 'About AT&T',
      links: [
        {label: 'About us', href: 'https://about.att.com/'},
        {label: 'Careers', href: 'https://about.att.com/careers/home/'},
        {label: 'Investors', href: 'https://investors.att.com/'},
      ],
    },
  ],
  legalText:
    'Demo storefront — layout inspired by att.com. Hero and banner slots resolve personalized copy from Sanity content releases.',
  copyright: '© AT&T Intellectual Property. Demo use only.',
}

export function AttFooter({footer}: {footer?: SiteFooter | null}) {
  const data = footer ?? DEFAULT_FOOTER
  const groups = data.linkGroups ?? []

  return (
    <footer className="att-footer">
      <div className="att-footer__inner">
        {groups.length > 0 ? (
          <div className="att-footer__columns">
            {groups.map((group) => (
              <div key={group.title} className="att-footer__column">
                <h3 className="att-footer__column-title">{group.title}</h3>
                <ul className="att-footer__links">
                  {(group.links ?? []).map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        {data.legalText ? <p className="att-footer__legal">{data.legalText}</p> : null}
        {data.copyright ? <p className="att-footer__copy">{data.copyright}</p> : null}
      </div>
    </footer>
  )
}
