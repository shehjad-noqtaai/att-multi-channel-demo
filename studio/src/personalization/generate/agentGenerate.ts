// studio/src/personalization/generate/agentGenerate.ts
//
// The ONLY file in this package that touches the experimental Agent Actions
// surface (`apiVersion: 'vX'` + `client.agent.action.generate`). When the API
// shape changes, exactly one file changes.

import type {SanityClient} from '@sanity/client'

export const AGENT_ACTION_API_VERSION = 'vX'
// Single-workspace project → '_.schemas.default'. Re-capture after every `sanity schema deploy`.
export const AGENT_SCHEMA_ID = '_.schemas.default'

export type ChannelKey = 'web' | 'email' | 'sms'

// instructionParams values are typed; prefer these over string interpolation.
export type InstructionParam =
  | {type: 'constant'; value: string}
  | {type: 'field'; path: string}
  | {type: 'document'; documentId: string}
  | {type: 'groq'; query: string; params?: Record<string, unknown>}

export interface GenerateVariationArgs {
  targetId: string                                  // deterministic _id, see ids.ts
  channel: ChannelKey
  instruction: string
  instructionParams: Record<string, InstructionParam>
  withImage: boolean                                // true only for the 'web' channel
}

export async function agentGenerateVariation(
  client: SanityClient,
  {targetId, channel, instruction, instructionParams, withImage}: GenerateVariationArgs,
): Promise<unknown> {
  const agent = client.withConfig({apiVersion: AGENT_ACTION_API_VERSION})

  // `target` scopes WHICH paths Generate may write — this is what keeps a
  // variation single-channel and lets web (and only web) receive a hero image.
  //
  //   without image →  {path: ['web']}              (writes only the channel object)
  //   with image    →  [{path: ['web']},            (channel object …)
  //                     {path: ['web','heroImage','asset']}]   (… and the generated asset)
  const target = withImage
    ? [{path: [channel]}, {path: [channel, 'heroImage', 'asset']}]
    : {path: [channel]}

  // `agent.action.generate` is @beta. Returned shape is the updated document;
  // when withImage=true, the asset is *async* — `heroImage.asset` may resolve
  // after the call returns (preview UIs must null-guard).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (agent as any).agent.action.generate({
    schemaId: AGENT_SCHEMA_ID,
    // explicit _id + operation:'create' → idempotent target (orchestrate.ts clears first)
    targetDocument: {operation: 'create', _id: targetId, _type: 'contentVariation'},
    instruction,
    instructionParams,
    target,
  })
}
