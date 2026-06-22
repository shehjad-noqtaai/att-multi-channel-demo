// studio/scripts/importAttMediaToLibrary.ts
//
// Downloads homepage marketing images from att.com and uploads them for use in
// the demo. Prefers the org Sanity Media Library when the token has create
// permission; otherwise falls back to project-dataset assets + `mediaAsset` docs.
//
//   export SANITY_AUTH_TOKEN=<token with project write; ML write for library target>
//   npx tsx studio/scripts/importAttMediaToLibrary.ts
//   npx tsx studio/scripts/importAttMediaToLibrary.ts --target=project
//   npx tsx studio/scripts/importAttMediaToLibrary.ts --seed-homepage

import {createClient, type SanityClient} from '@sanity/client'
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const MEDIA_LIBRARY_ID = process.env.SANITY_MEDIA_LIBRARY_ID || 'mlPbiNDAEve1'
const ML_API_VERSION = '2025-02-19'
const ML_UI_BASE = `https://www.sanity.io/@oab7ManMj/media/${MEDIA_LIBRARY_ID}/assets`

/** Curated att.com homepage assets (from page HTML / scmsassets CDN). */
const ATT_ASSETS: Array<{
  id: string
  title: string
  description: string
  url: string
  tags: string[]
}> = [
  {
    id: 'att-logo-globe',
    title: 'AT&T globe logo',
    description: 'Vertical AT&T globe mark from att.com.',
    url: 'https://www.att.com/scmsassets/global/logos/att-logos/vertical/att_globe_500x500.jpg',
    tags: ['att', 'logo', 'brand'],
  },
  {
    id: 'att-fiber-hero',
    title: 'AT&T Fiber homepage hero',
    description: 'Fiber 1 GIG homepage hero background from att.com.',
    url: 'https://www.att.com/scmsassets/upper_funnel/internet/7110800-base-hero-150ff-lt-blue-hp-dsk-retina.jpg',
    tags: ['att', 'fiber', 'hero', 'homepage'],
  },
  {
    id: 'att-wireless-card-bg',
    title: 'Wireless promo card background',
    description: 'Wireless flex card background from att.com homepage.',
    url: 'https://www.att.com/scmsassets/upper_funnel/wireless/5085200-flex-card-bg-b1-dsk-retina.jpg',
    tags: ['att', 'wireless', 'promo', 'homepage'],
  },
  {
    id: 'att-iphone17-pro-card',
    title: 'iPhone 17 Pro promo card',
    description: 'iPhone 17 Pro trade-in promo tile from att.com.',
    url: 'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-lg-iphone17pro-dsk-tall-retina.png',
    tags: ['att', 'iphone', 'wireless', 'promo', 'homepage'],
  },
  {
    id: 'att-new-line-card',
    title: 'New line savings promo card',
    description: '$200 off per line promo tile from att.com.',
    url: 'https://www.att.com/scmsassets/upper_funnel/wireless/6332250-flex-card-sm-newline-v2-dsk-tall-retina.jpg',
    tags: ['att', 'wireless', 'promo', 'homepage'],
  },
  {
    id: 'att-home-phone-feature',
    title: 'Home phone feature image',
    description: 'Man on phone with laptop — att.com/home-phone feature block.',
    url: 'https://www.att.com/scmsassets/upper_funnel/other/1735850-offer-greatplan-dsk-retina.jpg',
    tags: ['att', 'home-phone', 'feature', 'homepage'],
  },
  {
    id: 'att-home-phone-advanced-card',
    title: 'Home phone Phone Advanced resource card',
    description: 'AT&T Phone Advanced — att.com/home-phone More resources.',
    url: 'https://www.att.com/scmsassets/sales/uf/internet/fiber/rivercard/1466807-rivercard-PhoneAdvanced-02-dsk-retina.jpg',
    tags: ['att', 'home-phone', 'resource', 'homepage'],
  },
  {
    id: 'att-home-phone-lifeline-card',
    title: 'Home phone Lifeline resource card',
    description: 'AT&T Lifeline — att.com/home-phone More resources.',
    url: 'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard-affordableservice-dsk-retina.jpg',
    tags: ['att', 'home-phone', 'resource', 'homepage'],
  },
  {
    id: 'att-home-phone-helpful-card',
    title: 'Home phone Helpful resources card',
    description: 'Helpful resources — att.com/home-phone More resources.',
    url: 'https://www.att.com/scmsassets/upper_funnel/other/1735850-rivercard2-phoneaccessories-dsk-retina.jpg',
    tags: ['att', 'home-phone', 'resource', 'homepage'],
  },
]

type UploadTarget = 'auto' | 'media-library' | 'project'

interface UploadResponse {
  document?: {_id: string; url?: string}
  assetDocument?: {_id: string; url?: string}
  asset?: {_id: string; url?: string}
  assetInstance?: {_id: string; url?: string}
  error?: {existingAssetId?: string; description?: string}
}

/** image-{hash}-{WxH}-{ext} → Media Library CDN URL */
function cdnUrlFromImageRef(ref: string, mediaLibraryId: string): string {
  const m = ref.match(/^image-(.+)-(\d+x\d+)-(\w+)$/)
  if (!m) return ''
  return `https://cdn.sanity.io/media-libraries/${mediaLibraryId}/images/${m[1]}-${m[2]}.${m[3]}`
}

function parseUploadResponse(json: UploadResponse, status: number, mediaLibraryId: string) {
  if (json.asset?._id) {
    return {
      mlAssetId: json.asset._id,
      url: json.assetInstance?.url ?? '',
      imageRef: json.assetInstance?._id,
    }
  }
  if (json.document?._id || json.assetDocument?._id) {
    const doc = json.document ?? json.assetDocument!
    return {mlAssetId: doc._id.replace(/^drafts\./, ''), url: doc.url ?? ''}
  }
  if (status === 409 && json.error?.existingAssetId) {
    const ref = json.error.existingAssetId
    return {
      mlAssetId: ref,
      url: cdnUrlFromImageRef(ref, mediaLibraryId),
      imageRef: ref,
      alreadyExists: true,
    }
  }
  return null
}

function parseArgs(argv: string[]): {target: UploadTarget; seedHomepage: boolean} {
  let target: UploadTarget = 'auto'
  let seedHomepage = false
  for (const a of argv) {
    if (a.startsWith('--target=')) target = a.split('=')[1] as UploadTarget
    if (a === '--seed-homepage') seedHomepage = true
  }
  return {target, seedHomepage}
}

async function download(url: string): Promise<{buffer: Buffer; filename: string}> {
  const res = await fetch(url, {
    headers: {'User-Agent': 'Mozilla/5.0 (compatible; att-demo-import/1.0)'},
  })
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop()?.split('?')[0] || 'asset.bin'
  return {buffer, filename}
}

async function uploadToMediaLibrary(
  token: string,
  buffer: Buffer,
  filename: string,
  title: string,
): Promise<{mlAssetId: string; url: string}> {
  const endpoint = new URL(
    `https://api.sanity.io/v${ML_API_VERSION}/media-libraries/${MEDIA_LIBRARY_ID}/upload`,
  )
  endpoint.searchParams.set('filename', filename)
  endpoint.searchParams.set('title', title)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  })

  const text = await res.text()
  let json: UploadResponse
  try {
    json = JSON.parse(text) as UploadResponse
  } catch {
    throw new Error(`Media Library upload failed (${res.status}): ${text}`)
  }

  const parsed = parseUploadResponse(json, res.status, MEDIA_LIBRARY_ID)
  if (!parsed?.mlAssetId) {
    throw new Error(`Media Library upload failed (${res.status}): ${text.slice(0, 300)}`)
  }

  return {
    mlAssetId: parsed.mlAssetId,
    url: parsed.url || '',
    alreadyExists: parsed.alreadyExists === true,
  }
}

async function uploadToProject(
  client: SanityClient,
  buffer: Buffer,
  filename: string,
): Promise<{assetId: string; url: string}> {
  const asset = await client.assets.upload('image', buffer, {filename})
  return {assetId: asset._id, url: asset.url}
}

async function main() {
  const {target, seedHomepage} = parseArgs(process.argv.slice(2))
  const token =
    process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new Error(
      'SANITY_AUTH_TOKEN env var required (or SANITY_API_READ_TOKEN from apps/storefront/.env)',
    )
  }

  console.log(`[info] Target Media Library: ${MEDIA_LIBRARY_ID}`)
  console.log(`[info] View assets: ${ML_UI_BASE}`)

  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'z6s0fz61',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    token,
    useCdn: false,
    apiVersion: '2024-10-01',
  })

  const cacheDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../assets/att-homepage',
  )
  await mkdir(cacheDir, {recursive: true})

  let useMediaLibrary = target === 'media-library'
  if (target === 'auto') {
    try {
      const probe = ATT_ASSETS[0]
      const {buffer, filename} = await download(probe.url)
      await uploadToMediaLibrary(token, buffer, filename, probe.title)
      useMediaLibrary = true
      console.log('[info] Media Library write access detected — using Media Library.')
    } catch (e) {
      useMediaLibrary = false
      console.warn(
        '[warn] Media Library upload not permitted with this token — using project dataset assets instead.',
      )
      console.warn(`       ${e instanceof Error ? e.message : String(e)}`)
      console.warn(
        '       For org Media Library uploads, use a token with Media Library create permission.',
      )
    }
  }

  console.log(
    `=== Importing ${ATT_ASSETS.length} att.com assets → ${useMediaLibrary ? `Media Library ${MEDIA_LIBRARY_ID}` : 'project dataset'} ===`,
  )

  const startIndex = target === 'auto' && useMediaLibrary ? 1 : 0

  for (const asset of ATT_ASSETS.slice(startIndex)) {
    process.stdout.write(`[${asset.id}] downloading… `)
    const {buffer, filename} = await download(asset.url)
    await writeFile(path.join(cacheDir, filename), buffer)
    process.stdout.write(`(${Math.round(buffer.length / 1024)}KB) uploading… `)

    if (useMediaLibrary) {
      const uploaded = await uploadToMediaLibrary(token, buffer, filename, asset.title)
      await client.createOrReplace({
        _id: `mediaAsset-${asset.id}`,
        _type: 'mediaAsset',
        title: asset.title,
        description: asset.description,
        url: uploaded.url || asset.url,
        mediaLibraryId: MEDIA_LIBRARY_ID,
        mlAssetId: uploaded.mlAssetId,
        tags: asset.tags,
      })
      console.log(
        `✓ media-library mlAsset=${uploaded.mlAssetId}${uploaded.alreadyExists ? ' (already existed)' : ''}`,
      )
    } else {
      const uploaded = await uploadToProject(client, buffer, filename)
      await client.createOrReplace({
        _id: `mediaAsset-${asset.id}`,
        _type: 'mediaAsset',
        title: asset.title,
        description: asset.description,
        tags: asset.tags,
        image: {
          _type: 'image',
          asset: {_type: 'reference', _ref: uploaded.assetId},
          alt: asset.title,
        },
      })
      console.log(`✓ project asset=${uploaded.assetId}`)
    }
  }

  // Re-import first asset if we probed it in auto+ML mode without creating doc
  if (target === 'auto' && useMediaLibrary) {
    const asset = ATT_ASSETS[0]
    const {buffer, filename} = await download(asset.url)
    const uploaded = await uploadToMediaLibrary(token, buffer, filename, asset.title)
    await client.createOrReplace({
      _id: `mediaAsset-${asset.id}`,
      _type: 'mediaAsset',
      title: asset.title,
      description: asset.description,
      url: uploaded.url || asset.url,
      mediaLibraryId: MEDIA_LIBRARY_ID,
      mlAssetId: uploaded.mlAssetId,
      tags: asset.tags,
    })
    console.log(`[${asset.id}] ✓ media-library mlAsset=${uploaded.mlAssetId}`)
  }

  console.log(`\n=== done. Local copies: ${cacheDir} ===`)
  console.log(`=== Media Library: ${ML_UI_BASE} ===`)

  if (seedHomepage) {
    console.log('\n=== Seeding storefront homepage with media references ===')
    const {execSync} = await import('node:child_process')
    execSync('npx tsx studio/scripts/seedStorefrontHomepage.ts', {
      stdio: 'inherit',
      env: process.env,
    })
  }
}

main().catch((err) => {
  console.error('[importAttMediaToLibrary] FAILED:', err)
  process.exit(1)
})
