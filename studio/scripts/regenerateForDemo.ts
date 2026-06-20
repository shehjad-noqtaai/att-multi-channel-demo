// studio/scripts/regenerateForDemo.ts
//
// Demo-prep tool. Re-runs generateMatrix across all seeded campaign briefs so
// every (brief × channel × segment × [step]) cell has fresh content, optionally
// promotes the per-brief releases at the end. Idempotent — re-running before a
// demo overwrites stale variations cleanly via createOrReplace.
//
// Usage:
//   SANITY_AUTH_TOKEN=<editor token> npx tsx studio/scripts/regenerateForDemo.ts \
//     [--brief <slug>]              # restrict to one brief slug (default: all)
//     [--channels web,email,sms]    # restrict channels (default: brief's targetChannels)
//     [--segments new,loyal]        # restrict segments (default: brief's targetSegments)
//     [--steps reminder,value]      # restrict flow steps for multi-step briefs
//     [--storefront-base-url <url>] # deep-link target (default: NEXT_PUBLIC_STOREFRONT_BASE_URL env)
//     [--promote]                   # publish each brief's release after generation
//     [--dry-run]                   # plan only — no Generate calls, no writes
//
// Token: needs editor / write role (not the deploy-studio token). SANITY_WRITE_TOKEN
// also accepted as fallback.

import {createClient, type SanityClient} from '@sanity/client'
import {generateMatrix, BRIEF_QUERY} from '../src/personalization/generate/orchestrate'
import {publishBriefRelease} from '../src/personalization/generate/releases'

interface CliArgs {
  briefSlug?: string
  channels?: string[]
  segments?: string[]
  steps?: string[]
  storefrontBaseUrl?: string
  promote: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {promote: false, dryRun: false}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--brief': out.briefSlug = next(); break
      case '--channels': out.channels = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--segments': out.segments = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--steps': out.steps = next().split(',').map((s) => s.trim()).filter(Boolean); break
      case '--storefront-base-url': out.storefrontBaseUrl = next(); break
      case '--promote': out.promote = true; break
      case '--dry-run': out.dryRun = true; break
      case '--help': case '-h':
        printUsage(); process.exit(0)
        break
      default:
        if (a?.startsWith('--')) throw new Error(`Unknown flag: ${a}`)
    }
  }
  return out
}

function printUsage() {
  console.log(`
regenerateForDemo — refresh every (brief × channel × segment × step) cell before a demo.

Flags:
  --brief <slug>             restrict to one brief slug (default: all briefs in dataset)
  --channels web,email,sms   restrict channels (default: brief's targetChannels)
  --segments new,loyal       restrict segments (default: brief's targetSegments)
  --steps reminder,value     restrict steps (multi-step briefs only)
  --storefront-base-url <u>  deep-link base (default: NEXT_PUBLIC_STOREFRONT_BASE_URL env)
  --promote                  publish each brief's release after generation
  --dry-run                  plan only — show the cell matrix, run no Generate calls
`)
}

interface BriefRow {
  _id: string
  title: string
  slug: string
  multiStep: boolean
  targetChannels: string[]
  targetSegments: string[]
  flowSteps: Array<{stepKey: string; channels: string[]}> | null
  generationReleaseId?: string
}

async function listBriefs(client: SanityClient, briefSlug?: string): Promise<BriefRow[]> {
  const raw = client.withConfig({perspective: 'raw'})
  const filter = briefSlug ? '&& slug.current == $slug' : ''
  return raw.fetch<BriefRow[]>(
    `*[_type=="campaignBrief" && defined(slug.current) ${filter}]{
      _id, title, "slug": slug.current, multiStep, generationReleaseId,
      "targetChannels": targetChannels[]->key,
      "targetSegments": targetSegments[]->key,
      "flowSteps": flowSteps[]{stepKey, "channels": channels[]->key}
    }`,
    {slug: briefSlug},
  )
}

function planCells(b: BriefRow, args: CliArgs): Array<{channel: string; segment: string; step?: string}> {
  const channelFilter = args.channels && new Set(args.channels)
  const segmentFilter = args.segments && new Set(args.segments)
  const stepFilter = args.steps && new Set(args.steps)

  const segments = (b.targetSegments ?? []).filter((s) => !segmentFilter || segmentFilter.has(s))

  const out: Array<{channel: string; segment: string; step?: string}> = []
  if (b.multiStep && b.flowSteps) {
    for (const step of b.flowSteps) {
      if (stepFilter && !stepFilter.has(step.stepKey)) continue
      const stepChannels = (step.channels ?? []).filter((c) => !channelFilter || channelFilter.has(c))
      for (const channel of stepChannels) {
        for (const segment of segments) out.push({channel, segment, step: step.stepKey})
      }
    }
  } else {
    const channels = (b.targetChannels ?? []).filter((c) => !channelFilter || channelFilter.has(c))
    for (const channel of channels) {
      for (const segment of segments) out.push({channel, segment})
    }
  }
  return out
}

async function main() {
  void BRIEF_QUERY // keep the import alive — useful for IDE jumping
  const args = parseArgs(process.argv.slice(2))

  const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN
  if (!token) {
    throw new Error('SANITY_AUTH_TOKEN (or SANITY_WRITE_TOKEN) env var required — needs editor/write role.')
  }

  const storefrontBaseUrl =
    args.storefrontBaseUrl ||
    process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL ||
    process.env.STOREFRONT_BASE_URL ||
    undefined
  if (!storefrontBaseUrl) {
    console.warn('[warn] no --storefront-base-url and no STOREFRONT_BASE_URL env — deep-link injection will be skipped.')
  }

  const client = createClient({
    projectId: 'z6s0fz61',
    dataset: 'production',
    token,
    useCdn: false,
    apiVersion: '2024-10-01',
  })

  const briefs = await listBriefs(client, args.briefSlug)
  if (briefs.length === 0) {
    console.error(`[err] no briefs found${args.briefSlug ? ` matching slug "${args.briefSlug}"` : ''}.`)
    process.exit(2)
  }

  // Plan summary
  console.log('=== plan ===')
  let totalCells = 0
  for (const b of briefs) {
    const cells = planCells(b, args)
    totalCells += cells.length
    console.log(`[${b.slug}] ${cells.length} cell${cells.length === 1 ? '' : 's'} (${b.multiStep ? 'multi-step' : 'single'})`)
    for (const c of cells) {
      console.log(`  - ${c.step ? `${c.step}/` : ''}${c.channel}/${c.segment}`)
    }
  }
  console.log(`=== total: ${totalCells} cells across ${briefs.length} brief${briefs.length === 1 ? '' : 's'} ===`)
  if (storefrontBaseUrl) console.log(`=== storefrontBaseUrl: ${storefrontBaseUrl} ===`)
  if (args.promote) console.log('=== --promote enabled: releases will be published after generation ===')

  if (args.dryRun) {
    console.log('[dry-run] exiting — no Generate calls made.')
    return
  }

  // Execute
  const failed: Array<{brief: string; id: string; error?: string}> = []
  for (const b of briefs) {
    console.log(`\n[${b.slug}] generating (${b.title})…`)
    const result = await generateMatrix(client, {
      briefId: b._id,
      channels: args.channels as never,
      segments: args.segments,
      steps: args.steps,
      storefrontBaseUrl,
      onProgress: (p) => {
        const step = p.current.step ? ` · ${p.current.step}` : ''
        process.stdout.write(`  ${p.done}/${p.total} ${p.current.channel}/${p.current.segment}${step}      \r`)
      },
    })
    process.stdout.write('\n')
    const gen = result.cells.filter((c) => c.status === 'generated').length
    const err = result.cells.filter((c) => c.status === 'error').length
    console.log(`  → ${gen} generated, ${err} errored. releaseId=${result.releaseId}`)
    for (const c of result.cells.filter((c) => c.status === 'error')) {
      failed.push({brief: b.slug, id: c.id, error: c.error})
      console.log(`    ✗ ${c.id}: ${c.error}`)
    }

    if (args.promote && err === 0 && gen > 0) {
      console.log(`  → promoting release ${result.releaseId}…`)
      try {
        await publishBriefRelease(client, b._id, result.releaseId)
        const publishedCount = await client.fetch<number>(
          'count(*[_type == "contentVariation" && brief._ref == $id])',
          {id: b._id},
        )
        const webCount = await client.fetch<number>(
          'count(*[_type == "contentVariation" && channel == "web" && brief._ref == $id])',
          {id: b._id},
        )
        console.log(
          `  ✓ release ${result.releaseId} published (${publishedCount} variation${publishedCount === 1 ? '' : 's'}, ${webCount} web)`,
        )
        if (publishedCount === 0) {
          console.warn(
            '  ⚠ no published variations visible after promote — check dataset read access / release state',
          )
        }
      } catch (e) {
        console.log(`  ✗ release publish failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    } else if (args.promote && err > 0) {
      console.log(`  → skipping release promote (${err} cell${err === 1 ? '' : 's'} errored)`)
    }
  }

  console.log(`\n=== done. total briefs=${briefs.length}, total failures=${failed.length} ===`)
  if (failed.length > 0) {
    console.log('Failures:')
    for (const f of failed) console.log(`  ${f.brief} · ${f.id}: ${f.error}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[regenerateForDemo] FAILED:', err)
  process.exit(1)
})
