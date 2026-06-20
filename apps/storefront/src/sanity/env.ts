// Read + validate the NEXT_PUBLIC_SANITY_* envs once. Fail loudly with a
// useful message rather than letting createClient default to an empty
// projectId and emit confusing 401s at request time.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var ${name}. See apps/storefront/.env.example.`)
  }
  return value
}

export const projectId = required(
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
)
export const dataset = required(
  'NEXT_PUBLIC_SANITY_DATASET',
  process.env.NEXT_PUBLIC_SANITY_DATASET,
)
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

// Server-only read token. Required when the dataset is not publicly readable
// (common on org projects). Never prefix with NEXT_PUBLIC_.
export const readToken = process.env.SANITY_API_READ_TOKEN

export const storefrontBaseUrl =
  process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL || 'http://localhost:3000'
