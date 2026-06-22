// studio/scripts/fixHomepageCampaignTags.ts
//
// Targeted, idempotent fix for the storefront homepage's campaign tags.
// Some published `storefront-homepage` docs shipped with the abandoned-cart
// hero + Fiber banner mistagged `campaignPreview: 'trade-in'`, so they leaked
// into the trade-in campaign view. This patches just those two array items by
// _key (it does NOT re-seed the whole doc, so any other homepage edits are
// preserved).
//
// Run with a token that belongs to a member of the project:
//   set -a; . studio/.env; set +a; npx tsx studio/scripts/fixHomepageCampaignTags.ts
// or:
//   SANITY_AUTH_TOKEN=<write-token> npx tsx studio/scripts/fixHomepageCampaignTags.ts

import {createClient} from '@sanity/client'

const DOC_ID = 'storefront-homepage'

// _key → correct campaignPreview value
const FIXES: Record<string, 'trade-in' | 'abandoned-cart'> = {
  'hero-abandoned-cart': 'abandoned-cart',
  'banner-fiber': 'abandoned-cart',
}

async function main() {
  const token =
    process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new Error(
      'A write-capable token is required. Set SANITY_AUTH_TOKEN (a token for a project member).',
    )
  }

  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'z6s0fz61',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    token,
    useCdn: false,
    apiVersion: '2024-10-01',
  })

  const set: Record<string, string> = {}
  for (const [key, value] of Object.entries(FIXES)) {
    set[`sections[_key=="${key}"].campaignPreview`] = value
  }

  // Patch the published document directly so it's live for the storefront
  // (which reads the published perspective). createIfNotExists is skipped on
  // purpose — if the doc doesn't exist, run the seed first.
  const result = await client.patch(DOC_ID).set(set).commit()
  console.log(`[fixHomepageCampaignTags] ✓ patched ${DOC_ID} (rev ${result._rev})`)
  for (const [key, value] of Object.entries(FIXES)) {
    console.log(`[fixHomepageCampaignTags]   ${key} → ${value}`)
  }
}

main().catch((err) => {
  console.error('[fixHomepageCampaignTags] FAILED:', err?.message || err)
  process.exit(1)
})
