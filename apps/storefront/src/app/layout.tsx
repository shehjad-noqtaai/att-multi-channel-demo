import type {Metadata} from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'AT&T Personalized Offers',
  description: 'Personalized offer landing pages — Sanity-driven storefront demo.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-header__brand">
            <span className="site-header__brand-accent">AT&T</span> Offers
          </Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
