import type {Metadata} from 'next'
import './globals.css'
import {AttHeader} from '@/components/home/AttHeader'
import {AttOrderCta} from '@/components/home/AttOrderCta'
import {sanityClient} from '@/sanity/client'
import {STOREFRONT_SHELL_QUERY} from '@/sanity/queries/storefront'
import {DEFAULT_STOREFRONT} from '@/lib/storefrontDefaults'
import type {SiteHeader, OrderCta} from '@/types/storefront'

export const metadata: Metadata = {
  title: 'AT&T | Wireless, Internet, and Personalized Offers',
  description:
    'Demo storefront — AT&T homepage shell with Sanity-driven personalized hero and banner content.',
}

export const revalidate = 60

export default async function RootLayout({children}: {children: React.ReactNode}) {
  // Resilient fetch: a Sanity outage / DNS hiccup must not crash the whole site.
  // Fall back to the default shell so the header + chrome still render.
  let shell: {header?: SiteHeader; orderCta?: OrderCta} | null = null
  try {
    shell = await sanityClient.fetch<{
      header?: SiteHeader
      orderCta?: OrderCta
    } | null>(STOREFRONT_SHELL_QUERY, {})
  } catch (err) {
    console.error('[RootLayout] storefront shell fetch failed — using defaults:', err)
  }

  return (
    <html lang="en">
      <body>
        <AttHeader header={shell?.header ?? DEFAULT_STOREFRONT.header} />
        <AttOrderCta cta={shell?.orderCta ?? DEFAULT_STOREFRONT.orderCta} />
        <main>{children}</main>
      </body>
    </html>
  )
}
