import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, readToken} from './env'
import {RELEASES_API_VERSION, previewEnabled} from './client'

export interface ReleaseOption {
  /** Release id — used as the perspective value. */
  id: string
  title: string
  type?: string
}

/**
 * List the active content releases so the preview control can offer them.
 * Server-only (needs the read token); returns [] when preview is disabled.
 */
export async function listActiveReleases(): Promise<ReleaseOption[]> {
  if (!previewEnabled) return []
  const client = createClient({
    projectId,
    dataset,
    apiVersion: RELEASES_API_VERSION,
    token: readToken,
    useCdn: false,
    perspective: 'raw',
  })
  try {
    // Query the release system documents directly. The `releases::all()` GROQ
    // function returns null for plain projections in some API versions, whereas
    // the document form is reliable. `name` is the release id used as the
    // storefront preview perspective.
    const rows = await client.fetch<Array<{name: string; title?: string; type?: string}>>(
      `*[_type == "system.release" && state == "active"]{name, "title": metadata.title, "type": metadata.releaseType}`,
    )
    return (rows ?? []).map((r) => ({id: r.name, title: r.title || r.name, type: r.type}))
  } catch {
    // Releases API unavailable (older dataset / no permission) — degrade to none.
    return []
  }
}
