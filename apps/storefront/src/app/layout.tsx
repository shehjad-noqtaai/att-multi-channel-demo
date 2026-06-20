import type {Metadata} from 'next'
import './globals.css'
import {AttHeader} from '@/components/home/AttHeader'

export const metadata: Metadata = {
  title: 'AT&T | Wireless, Internet, and Personalized Offers',
  description:
    'Demo storefront — AT&T homepage shell with Sanity-driven personalized hero and banner content.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <AttHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
