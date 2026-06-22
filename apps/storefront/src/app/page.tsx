import Link from 'next/link'
import {Suspense} from 'react'
import {getClient, previewEnabled, PUBLISHED_PERSPECTIVE} from '@/sanity/client'
import {STOREFRONT_QUERY} from '@/sanity/queries/storefront'
import {MERGE_FIELDS_QUERY} from '@/sanity/queries'
import {listActiveReleases} from '@/sanity/releases'
import {PageSections} from '@/components/home/PageSections'
import {AudienceSimulator} from '@/components/home/AudienceSimulator'
import {AttFooter} from '@/components/home/AttFooter'
import {PERSONAS} from '@/lib/personas'
import {parseCampaignPreview} from '@/lib/campaignPreview'
import {parseSimOverrides, type SimMergeField} from '@/lib/simulator'
import {mergeStorefrontWithDefaults} from '@/lib/storefrontDefaults'
import type {PersonaKey} from '@/types'
import type {StorefrontHomepage} from '@/types/storefront'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parsePersona(value: string | string[] | undefined): PersonaKey {
  const v = Array.isArray(value) ? value[0] : value
  if (v && v in PERSONAS) return v as PersonaKey
  return 'new'
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function HomePage({searchParams}: PageProps) {
  const sp = await searchParams
  const persona = parsePersona(sp.persona)
  const campaign = parseCampaignPreview(first(sp.campaign))
  const overrides = parseSimOverrides(sp)

  // Preview perspective is gated: only honored when a server read token is set.
  const perspectiveParam = first(sp.perspective)
  const perspective = previewEnabled && perspectiveParam ? perspectiveParam : PUBLISHED_PERSPECTIVE
  const client = getClient(perspective)
  const isPreview = perspective !== PUBLISHED_PERSPECTIVE

  const [raw, mergeFields, releases] = await Promise.all([
    client.fetch<StorefrontHomepage | null>(STOREFRONT_QUERY, {}),
    client.fetch<SimMergeField[]>(MERGE_FIELDS_QUERY, {}),
    listActiveReleases(),
  ])
  const cms = mergeStorefrontWithDefaults(raw)

  return (
    <div className="att-home">
      {isPreview ? (
        <div className="att-home__preview-banner" role="status">
          Previewing staged content from release{' '}
          <strong>{releases.find((r) => r.id === perspective)?.title ?? perspective}</strong> — not
          live. <Link href="/">Exit preview</Link>
        </div>
      ) : null}

      <Suspense fallback={null}>
        <AudienceSimulator
          activeCampaign={campaign}
          activePersona={persona}
          activePerspective={perspective}
          mergeFields={mergeFields ?? []}
          releases={releases}
          previewEnabled={previewEnabled}
        />
      </Suspense>

      <PageSections
        sections={cms.sections ?? []}
        persona={persona}
        campaign={campaign}
        overrides={overrides}
        client={client}
      />

      <section className="att-home__demo-note">
        <div className="att-home__demo-note-inner">
          <p>
            Use the <strong>Audience Simulator</strong> to switch campaign, segment, and simulated
            user details. {previewEnabled ? 'Switch Source to preview a staged release. ' : ''}
            <Link href="/offers">Browse all personalized offers →</Link>
          </p>
        </div>
      </section>

      <AttFooter footer={cms.footer} />
    </div>
  )
}
