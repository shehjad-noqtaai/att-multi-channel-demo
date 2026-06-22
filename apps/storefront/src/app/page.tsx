import Link from 'next/link'
import {Suspense} from 'react'
import {sanityClient} from '@/sanity/client'
import {STOREFRONT_QUERY} from '@/sanity/queries/storefront'
import {PageSections} from '@/components/home/PageSections'
import {PersonaPreviewPicker} from '@/components/home/PersonaPreviewPicker'
import {CampaignPreviewPicker} from '@/components/home/CampaignPreviewPicker'
import {AttFooter} from '@/components/home/AttFooter'
import {PERSONAS} from '@/lib/personas'
import {parseCampaignPreview} from '@/lib/campaignPreview'
import {mergeStorefrontWithDefaults} from '@/lib/storefrontDefaults'
import type {PersonaKey} from '@/types'
import type {StorefrontHomepage} from '@/types/storefront'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{persona?: string; campaign?: string}>
}

function parsePersona(value: string | undefined): PersonaKey {
  if (value && value in PERSONAS) return value as PersonaKey
  return 'new'
}

export default async function HomePage({searchParams}: PageProps) {
  const {persona: personaParam, campaign: campaignParam} = await searchParams
  const persona = parsePersona(personaParam)
  const campaign = parseCampaignPreview(campaignParam)

  const raw = await sanityClient.fetch<StorefrontHomepage | null>(STOREFRONT_QUERY, {})
  const cms = mergeStorefrontWithDefaults(raw)

  return (
    <div className="att-home">
      <Suspense fallback={null}>
        <div className="att-home__persona-wrap">
          <CampaignPreviewPicker active={campaign} />
          <PersonaPreviewPicker active={persona} />
        </div>
      </Suspense>

      <PageSections sections={cms.sections ?? []} persona={persona} campaign={campaign} />

      <section className="att-home__demo-note">
        <div className="att-home__demo-note-inner">
          <p>
            Use <strong>Campaign</strong> to switch between trade-in and abandoned-cart heroes.
            Use <strong>Preview as</strong> to change the audience segment within that campaign.{' '}
            <Link href="/offers">Browse all personalized offers →</Link>
          </p>
        </div>
      </section>

      <AttFooter footer={cms.footer} />
    </div>
  )
}
