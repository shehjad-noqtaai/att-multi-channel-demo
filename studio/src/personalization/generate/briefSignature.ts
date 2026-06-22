// studio/src/personalization/generate/briefSignature.ts
//
// A stable hash of a brief's *content* fields — the inputs that actually shape
// generated variations. Used to drive the "Out of date" badge.
//
// Why not brief._rev? The brief's revision (and _updatedAt) churn on
// bookkeeping mutations that don't affect content — notably setting/clearing
// `generationReleaseId` around generate/publish. Comparing revs therefore marks
// every variation "out of date" even right after regenerating. A content
// signature ignores those bookkeeping fields, so it only changes when the
// marketer actually edits the brief's content.
//
// Both the generator (stored on each variation) and the matrix views (compared
// live) must compute this over the SAME field set — keep the inputs in sync.

type RefLike = {_ref?: string; _id?: string}

/** Sorted document ids from a ref array, tolerating deref'd ({_id}) or raw ({_ref}) shapes. */
function refIds(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((x) => {
      const o = (x ?? {}) as RefLike
      return o._ref ?? o._id
    })
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .sort()
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

/** Small stable string hash (djb2 → base36). */
function djb2(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * Hash of a brief's content-relevant fields. Accepts any brief-ish object
 * (deref'd or raw refs); unknown param so typed interfaces from any workspace
 * pass without index-signature friction.
 */
export function briefContentSignature(brief: unknown): string {
  if (!brief || typeof brief !== 'object') return ''
  const b = brief as Record<string, unknown>
  const fp = (b.featuredProduct ?? null) as RefLike | null
  const steps = Array.isArray(b.flowSteps)
    ? (b.flowSteps as Array<Record<string, unknown>>).map((s) => ({
        k: asString(s?.stepKey),
        i: asString(s?.intent),
        ch: refIds(s?.channels),
      }))
    : []
  const payload = {
    summary: asString(b.summary),
    offer: asString(b.offer),
    keyMessages: asStringArray(b.keyMessages),
    disclaimers: asStringArray(b.mandatoryDisclaimers),
    multiStep: !!b.multiStep,
    channels: refIds(b.targetChannels),
    segments: refIds(b.targetSegments),
    media: refIds(b.allowedMedia),
    featuredProduct: fp?._ref ?? fp?._id ?? null,
    steps,
  }
  return djb2(JSON.stringify(payload))
}
