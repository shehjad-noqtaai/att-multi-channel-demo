import {createClient, type SanityClient} from 'next-sanity'
import {apiVersion, dataset, projectId, readToken} from './env'
import {PUBLISHED_PERSPECTIVE} from '@/lib/simulator'

export {PUBLISHED_PERSPECTIVE}

// Storefront defaults to the published perspective. Drafts and release-staged
// content are invisible to anonymous traffic — the storefront mirrors what real
// customers would see post-publish.
//
// When the dataset is private, pass SANITY_API_READ_TOKEN (server-only) so
// server components can fetch published variations.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  useCdn: !readToken,
  perspective: 'published',
})

// Release/version APIs (and reading a release as a perspective) require this
// API version or later.
export const RELEASES_API_VERSION = '2025-02-19'

/**
 * Preview is only available when a server-side read token is configured. A
 * non-published perspective can never be served from the CDN, so it also needs
 * the token to authenticate the live (uncached) read.
 */
export const previewEnabled = !!readToken

/**
 * Return a client for the requested perspective.
 *   - 'published' (or preview disabled) → the cached, CDN-backed published client.
 *   - any other value → treated as a release id; layered over drafts + published
 *     and read live (no CDN) with the server token.
 */
export function getClient(perspective?: string): SanityClient {
  if (!perspective || perspective === PUBLISHED_PERSPECTIVE || !previewEnabled) {
    return sanityClient
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: RELEASES_API_VERSION,
    token: readToken,
    useCdn: false,
    // A release id as the first layer, falling back to drafts then published,
    // so a cell missing from the release still resolves from published.
    perspective: [perspective, 'drafts', 'published'],
  })
}
