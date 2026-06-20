// Thin adapter around the Studio's resolveTokens so the storefront uses the
// exact same token-merge logic without duplicating it. Reused via the
// @studio/* alias (see tsconfig.json + next.config.ts).

import {resolveTokens} from '@studio/personalization/generate/tokens'
import type {MergeField, MinimalBrief} from '@studio/personalization/generate/tokens'
import {sanityClient} from './client'

/**
 * mergeText — resolve {{token}} occurrences in a single string, server-side.
 *
 * Tokens that can't be resolved are left as-is (`{{key}}`); the storefront
 * renders them verbatim (no chips, no styling).
 */
export async function mergeText(
  text: string | undefined,
  brief: MinimalBrief,
  mergeFields: MergeField[],
): Promise<string> {
  if (!text) return ''
  return resolveTokens(text, {brief, mergeFields, client: sanityClient})
}
