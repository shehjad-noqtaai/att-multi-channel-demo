// Thin adapter around the Studio's resolveTokens so the storefront uses the
// exact same token-merge logic without duplicating it. Reused via the
// @studio/* alias (see tsconfig.json + next.config.ts).

import {resolveTokens} from '@studio/personalization/generate/tokens'
import type {MergeField, MinimalBrief} from '@studio/personalization/generate/tokens'
import {sanityClient} from './client'
import type {SanityClient} from 'next-sanity'

export interface MergeTextOptions {
  /** Per-token value overrides (Audience Simulator). */
  overrides?: Record<string, string | undefined>
  /** Client used for Sanity-sourced tokens — defaults to the published client. */
  client?: SanityClient
}

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
  options?: MergeTextOptions,
): Promise<string> {
  if (!text) return ''
  return resolveTokens(text, {
    brief,
    mergeFields,
    client: options?.client ?? sanityClient,
    overrides: options?.overrides,
  })
}
