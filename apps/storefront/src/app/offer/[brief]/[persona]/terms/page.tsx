import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityClient} from '@/sanity/client'
import {TERMS_QUERY} from '@/sanity/queries'
import {BrandShell} from '@/components/BrandShell'
import {TermsView} from '@/components/TermsView'
import type {TermsData} from '@/types'

export const revalidate = 60

interface RouteParams {
  brief: string
  persona: string
}

interface PageProps {
  params: Promise<RouteParams>
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {brief} = await params
  const data = await sanityClient.fetch<TermsData | null>(TERMS_QUERY, {brief, persona: 'new'})
  return {title: data?.title ? `Terms — ${data.title}` : 'Offer terms'}
}

export default async function TermsPage({params}: PageProps) {
  const {brief, persona} = await params
  const data = await sanityClient.fetch<TermsData | null>(TERMS_QUERY, {brief, persona})
  if (!data) notFound()

  return (
    <BrandShell brandColor={data.persona?.brandColor}>
      <div className="page">
        <TermsView briefSlug={brief} persona={persona} data={data} />
      </div>
    </BrandShell>
  )
}
