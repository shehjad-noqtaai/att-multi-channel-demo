import Link from 'next/link'

const NAV = [
  {label: 'Shop', href: 'https://www.att.com/shop/'},
  {label: 'Deals', href: 'https://www.att.com/deals/'},
  {label: 'AT&T Difference', href: 'https://www.att.com/why-att/'},
  {label: 'Support', href: 'https://www.att.com/support/'},
]

export function AttHeader() {
  return (
    <header className="att-header">
      <div className="att-header__utility">
        <div className="att-header__utility-inner">
          <span className="att-header__utility-links">
            <Link href="/">Personal</Link>
            <a href="https://www.att.com/business/">Business</a>
          </span>
          <span className="att-header__utility-links">
            <a href="https://www.att.com/stores/">Find a store</a>
          </span>
        </div>
      </div>
      <div className="att-header__main">
        <div className="att-header__main-inner">
          <Link href="/" className="att-header__logo" aria-label="AT&T home">
            AT&amp;T
          </Link>
          <nav className="att-header__nav" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="att-header__nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="att-header__actions">
            <Link href="/offers" className="att-header__offers-link">
              Personalized offers
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
