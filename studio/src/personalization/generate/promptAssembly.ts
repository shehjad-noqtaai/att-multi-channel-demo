// studio/src/personalization/generate/promptAssembly.ts
//
// Pure. Builds the {instruction, instructionParams, assignHeroFromMedia} payload
// for a single (brief × [step] × channel × segment) cell.

import type {AllowedMediaItem} from './allowedMedia'
import {formatAllowedMediaForPrompt, hasMediaSource} from './allowedMedia'
import type {ChannelKey, InstructionParam} from './agentGenerate'

export type {ChannelKey, InstructionParam} from './agentGenerate'

export interface PromptBrief {
  _id: string
  _rev?: string
  offer?: string
  keyMessages?: string[]
  mandatoryDisclaimers?: string[]
  allowedMedia?: AllowedMediaItem[]
}

export interface PromptChannel {
  key: ChannelKey
  title: string
  constraints?: string
  /** Optional hard cap (e.g. SMS 600). Used by the SMS concision directive. */
  maxLength?: number
}

export interface PromptSegment {
  key: string
  title: string
  brand: string
  brandVoice: string
  audienceProfile: string
  brandDisclaimers?: string[]
}

export interface PromptStep {
  stepKey: string
  delayLabel: string
  intent: string
}

export interface PromptMergeField {
  key: string
  description?: string
}

export interface BuildPromptArgs {
  brief: PromptBrief
  channel: PromptChannel
  segment: PromptSegment
  step?: PromptStep
  mergeFields: PromptMergeField[]
}

export interface BuildPromptResult {
  instruction: string
  instructionParams: Record<string, InstructionParam>
  /** When true, orchestrate assigns heroImage from brief.allowedMedia after Generate. */
  assignHeroFromMedia: boolean
}

const BRAND_DISPLAY: Record<string, string> = {
  att: 'AT&T',
  firstnet: 'FirstNet',
  cricket: 'Cricket',
}

function brandName(brand: string): string {
  return BRAND_DISPLAY[brand] ?? brand
}

function allDisclaimers(brief: PromptBrief, segment: PromptSegment): string[] {
  const out: string[] = []
  if (brief.mandatoryDisclaimers) out.push(...brief.mandatoryDisclaimers)
  if (segment.brandDisclaimers) out.push(...segment.brandDisclaimers)
  return out
}

export function buildPrompt(args: BuildPromptArgs): BuildPromptResult {
  const {brief, channel, segment, step, mergeFields} = args
  // Accept both project-asset refs and Media Library URL assets.
  const allowed = (brief.allowedMedia ?? []).filter(hasMediaSource)
  const assignHeroFromMedia = channel.key === 'web' && allowed.length > 0

  const flowStepLine = step
    ? `This is the "${step.stepKey}" step (${step.delayLabel}). Intent: ${step.intent}`
    : ''

  const mediaDirective = assignHeroFromMedia
    ? 'Do NOT generate or invent hero images. The hero image will be assigned from the brief allowed media library after copy is written — write headline/subheadline only.\nAllowed media (for context when writing copy):\n$allowedMedia'
    : channel.key === 'web'
      ? 'Do NOT set or generate a hero image — none are allowed on this brief.'
      : ''

  // URL/link directive — we own the deep-link, the model must not author it.
  // For SMS the link is appended after this directive runs (see orchestrate.ts
  // buildOfferUrl). For web/email the ctaUrl is the same deal — leave it blank
  // and we'll set it deterministically.
  const urlDirective =
    channel.key === 'sms'
      ? 'Do NOT write any URLs or links in the message text — sms.link is set automatically. Leave sms.link blank; we set it after generation. End the message with "View offer:" (no URL after) so the system can append the link cleanly.'
      : 'Leave the ctaUrl field blank — it is set automatically to the personalized offer page after generation. Focus on a compelling ctaLabel.'

  // Concision directive — long legal/T&C text belongs on the linked terms page,
  // not inline in the channel message. SMS gets a HARD explicit length ceiling
  // because past runs showed the model ignoring soft "stay under the limit"
  // guidance and emitting 333–463 char messages against a 250 cap.
  const concisionDirective =
    channel.key === 'sms' && channel.maxLength
      ? `SMS LENGTH IS A HARD CONSTRAINT. The sms.message field MUST be at most ${channel.maxLength} characters total, INCLUDING spaces and punctuation. AIM for ${Math.max(50, channel.maxLength - 100)} characters or fewer to leave headroom. Do NOT inline any disclaimers, terms, legal copy, or long brand context — a "View offer" link is appended automatically and the linked page hosts all of that. Count your characters. If your draft is over ${channel.maxLength}, cut it down before returning. Messages over the limit will be rejected.`
      : 'Keep the message tightly focused on THIS offer. Do NOT inline long legal/T&C text — a separate "See full terms" page will host disclaimers; the message just needs to deliver the offer + CTA. Stay well under the channel character limit; leave headroom.'

  const instruction =
    `You are writing $channelTitle marketing copy for the $brand brand, targeting "$segmentTitle".\n` +
    `Campaign brief: $brief\n` +
    `$flowStepLine\n` +
    `Offer: $offer\n` +
    `Must include key messages: $keyMessages\n` +
    `Brand voice: $brandVoice\n` +
    `Audience profile: $segmentProfile\n` +
    `Channel constraints (MANDATORY): $channelConstraints\n` +
    `Include these disclaimers verbatim, unedited: $disclaimers\n` +
    `For product, pricing, cart, and customer-specific values you do NOT own, insert the exact token (e.g. {{product.name}}) — never invent these values. Available tokens: $tokens\n` +
    `Write only the $channel content fields; stay within all length limits.\n` +
    concisionDirective + '\n' +
    urlDirective + '\n' +
    mediaDirective

  const instructionParams: Record<string, InstructionParam> = {
    channelTitle: {type: 'constant', value: channel.title},
    channel: {type: 'constant', value: channel.key},
    brand: {type: 'constant', value: brandName(segment.brand)},
    segmentTitle: {type: 'constant', value: segment.title},
    brief: {type: 'document', documentId: brief._id},
    offer: {type: 'constant', value: brief.offer ?? ''},
    keyMessages: {type: 'constant', value: (brief.keyMessages ?? []).join('; ')},
    brandVoice: {type: 'constant', value: segment.brandVoice},
    segmentProfile: {type: 'constant', value: segment.audienceProfile},
    channelConstraints: {type: 'constant', value: channel.constraints ?? ''},
    disclaimers: {type: 'constant', value: allDisclaimers(brief, segment).join('\n')},
    tokens: {
      type: 'constant',
      value: mergeFields
        .map((m) => `{{${m.key}}} — ${m.description ?? ''}`.trimEnd())
        .join('\n'),
    },
    flowStepLine: {type: 'constant', value: flowStepLine},
    allowedMedia: {
      type: 'constant',
      value: assignHeroFromMedia ? formatAllowedMediaForPrompt(allowed) : '',
    },
  }

  return {instruction, instructionParams, assignHeroFromMedia}
}
