// Audience Simulator URL state. The simulator encodes overridden merge-field
// values as individual query params prefixed `sim_`, e.g.
// `sim_customer.firstName=Alex`. Only changed fields are written, so an unset
// field falls back to the mergeField's `sampleValue`. Keeping each override as
// its own param keeps previews shareable and avoids custom encoding.

export const SIM_PARAM_PREFIX = 'sim_'

/** The default (live) perspective name. Kept here so client components can
 * import it without pulling in the server-only Sanity client module. */
export const PUBLISHED_PERSPECTIVE = 'published'

export interface SimMergeField {
  key: string
  label?: string
  source?: 'external' | 'sanity'
  sampleValue?: string
  description?: string
}

/** Read all `sim_<key>` params into a {key: value} override map. */
export function parseSimOverrides(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, value] of Object.entries(searchParams)) {
    if (!name.startsWith(SIM_PARAM_PREFIX)) continue
    const key = name.slice(SIM_PARAM_PREFIX.length)
    const v = Array.isArray(value) ? value[0] : value
    if (typeof v === 'string' && v !== '') out[key] = v
  }
  return out
}

/** The param name for a given merge-field key. */
export function simParamName(key: string): string {
  return `${SIM_PARAM_PREFIX}${key}`
}
