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
  const shell = await sanityClient.fetch<{
    header?: SiteHeader
    orderCta?: OrderCta
  } | null>(STOREFRONT_SHELL_QUERY, {})

  return (
    <html lang="en">
      <body>
        <AttHeader header={shell?.header} />
        <AttOrderCta cta={shell?.orderCta ?? DEFAULT_STOREFRONT.orderCta} />
        <main>{children}</main>
      </body>
    </html>
  )
}
