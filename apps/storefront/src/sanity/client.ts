import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from './env'

// Storefront uses the CDN + the published perspective only. Drafts and
// release-staged content are intentionally invisible — the storefront mirrors
// what real customers would see post-publish.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
