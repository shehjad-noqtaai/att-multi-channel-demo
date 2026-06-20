import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, readToken} from './env'

// Storefront uses the published perspective only. Drafts and release-staged
// content are intentionally invisible — the storefront mirrors what real
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
