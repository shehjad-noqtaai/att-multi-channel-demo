# PRD — AT&T Multi-channel Personalization POC

> A build-ready Product Requirements Document for AI agents to implement a Sanity-powered demo. Scope, decisions, content model, AI pipeline, and an incremental build plan are all specified below.

## Context

**The opportunity.** AT&T wants to personalize the customer experience across every channel. Today, producing on-brand, on-message copy for each channel × audience combination is manual, slow, and inconsistent. This POC demonstrates how **Sanity's AI (Agent Actions)** turns a single marketer-authored *campaign brief* into a full matrix of channel- and segment-specific content variations — generated, previewable, and editable entirely inside Sanity.

**The "wow" moment.** A marketer writes one brief in an **App SDK app**, clicks *Generate variations*, and Sanity AI produces **12 personalized variations** (3 channels × 4 segments) — each one shaped to the channel's format and the segment's brand voice. All 12 are previewable as a live channel × segment matrix inside Sanity Studio with channel-accurate mockups.

**What this is.** A POC/demo, not production. Optimize for a reliable, visually compelling demo path over completeness. Reuse the proven architecture of an existing reference demo (see below).

### Decisions locked with stakeholder (2026-06-16)
| Decision | Choice |
|---|---|
| AI engine | **Agent Actions Generate** (`client.agent.action.generate`). Content Agent API noted as an optional future chat-based brief assistant — out of scope for v1. |
| Surfaces | **App SDK app** (brief management + trigger generation) **+ Sanity Studio preview matrix**. No public-facing frontend. |
| Channels (3) | Web / landing page, Email, SMS / push |
| Segments (4) | New / prospective, Existing / loyal, Business / FirstNet, Value / prepaid (Cricket) |
| Campaign types (2) | **Promotional** (one-shot, the base matrix) and **Abandoned-cart flow** (triggered, multi-step lifecycle sequence) |
| Matrix | Promotional: 3 × 4 = **12 variations**. Abandoned-cart: per **flow step** × channel × segment. |
| Brand → segment map | AT&T (new, loyal), FirstNet (business), Cricket (value) |
| Placeholders | Generated copy uses **merge-field tokens** (`{{product.name}}`, `{{cart.recoveryUrl}}`, …) for data that lives **outside Sanity**; tokens resolve at preview/delivery from an **external source** or, when the data lives in Sanity, from **Sanity content**. |

### Reference template (reuse, don't reinvent)
A high-quality BMW multi-market demo lives at:
`out/dpl_4dfJtvSpNwGwKzPitJF1Nc9QMbgA/source/`

It already solves nearly every architectural problem we face. **Mirror these patterns directly:**
- **Agent Actions, isolated**: `studio/src/plugins/aidaContentOps/translate/agentTranslate.ts` — the only file touching the `@beta` `apiVersion:'vX'` surface (`target` path scoping, `schemaId`, `conditionalPaths`). We build the **Generate** equivalent the same way.
- **Framework-agnostic orchestration**: `translate/orchestrate.ts` — pure logic reused by *both* a Studio tool and a standalone App SDK app. We mirror this so one module powers our app + Studio action.
- **App SDK app + Studio tool sharing UI**: `apps/hq-rollout/` + `studio/src/tools/hqRollout/` (+ `apps/hq-rollout/CLAUDE.md` for hook/gotcha list).
- **Schema conventions**: `studio/src/schemaTypes/objects/seo.ts` (`defineType`/`defineField`, `validation` `.warning()`/`.error()`, image `aiAssist`).
- **Stack** (match versions): `sanity ^5.30`, React 19, `@sanity/sdk` + `@sanity/sdk-react` ^2.12, `@sanity/ui` ^3, `@sanity/client ^7.20`, `@sanity/assist ^6` (for image-gen presence), `@sanity/blueprints`/`@sanity/functions` (optional Function trigger).

---

## Architecture overview

```
campaignBrief (marketer authors)  ──┐
  type: promotional | abandoned-cart │  Agent Actions Generate (vX), per cell
channel × segment (× flow step) ─────┼─────────────────────────►  contentVariation (copy w/ {{tokens}})
brand voice / disclaimers           │   instruction + instructionParams + token list       │
mergeField token registry ─────────┘                                                       │
                                                                                            ▼
   App SDK app  ◄── shared orchestrate.ts ──►  Studio "Variations" doc view (matrix + token toggle)
   (brief CRUD, Generate w/ progress, matrix)        │
                                                      ▼  resolveTokens at preview/delivery
                              ┌───────────────────────┴───────────────────────┐
                  external system (commerce/PIM/CRM)              Sanity content (offer, product doc)
                  {{product.name}}, {{cart.recoveryUrl}}          {{offer.amount}}, {{product.*}} when in Sanity
```

One pure module (`orchestrate.ts`) is the single source of generation logic, consumed by the App SDK app and an in-Studio document action. Generated copy carries **merge-field tokens** for data Sanity may not own; `resolveTokens` fills them at preview/delivery from an external source or from Sanity content.

---

## Content model

Single Studio workspace, single project/dataset. All types use `defineType`/`defineField` matching `seo.ts`.

### `campaignBrief` (document) — the marketer's input
- `title` (string, required) — internal campaign name; `slug` (slug, source title).
- `campaignType` (string, required, list: `promotional` | `abandoned-cart`) — drives which fields show and how the matrix is dimensioned. Default `promotional`.
- `summary` (text, required) — core brief / value proposition. Read by Generate via `{type:'document', documentId}`.
- `goal` (string, list: awareness / acquisition / retention / upsell / cart-recovery).
- `offer` (text) — specific promo, e.g. "$10/mo off for 12 months". Also exposed as the Sanity-resolved `{{offer.*}}` token (see Placeholders).
- `keyMessages` (array<string>) — must-include talking points.
- `mandatoryDisclaimers` (array<string>) — legal lines the AI MUST append verbatim.
- `targetChannels` (array<reference→`channel`>) — default all 3.
- `targetSegments` (array<reference→`segment`>) — default all 4.
- `landingUrlBase` (url) — base for CTA links.
- `flowSteps` (array<object `flowStep`>, **shown only when `campaignType==='abandoned-cart'`**) — ordered recovery sequence. Each `flowStep`: `stepKey` (string, e.g. `reminder`/`incentive`/`urgency`), `delayLabel` (string, e.g. "1 hour after abandon", "24 hours", "48 hours"), `intent` (text — what this step should accomplish), `channels` (array<reference→`channel`>, e.g. email then SMS/push). Variations are generated per **step × channel × segment**.
- `featuredProduct` (reference→`product`, optional) — when set, product tokens (`{{product.*}}`) resolve from **Sanity content** instead of the external sample (see Placeholders). Demonstrates Sanity as the orchestration layer regardless of where data lives.
- Field groups: **Brief / Constraints / Targeting / Flow**.

### `channel` (document, config — seeded, admin-edit-only, no create)
- `key` (string, required, unique: `web` | `email` | `sms`) — the discriminator used in code + ids.
- `title` (string) — display label.
- `constraints` (text) — natural-language rules injected into the prompt (SMS: "≤160 chars, one link, include 'Txt STOP to opt out', no emojis").
- `maxLength` (number, optional) — hard cap (160 for SMS).
- `icon`, `order`.

### `segment` (document, config — seeded, admin-edit-only, no create)
Carries the brand mapping + audience profile + tone that personalize each variation.
- `key` (string, required, unique: `new` | `loyal` | `business` | `value`).
- `title` (string).
- `brand` (string, list: `att` | `firstnet` | `cricket`).
- `brandVoice` (text) — voice/tone guide (Cricket = playful/value; FirstNet = mission-critical/reliability; AT&T loyal = appreciative/premium).
- `audienceProfile` (text) — who they are, motivations, objections.
- `tone` (string) — short descriptor.
- `brandDisclaimers` (array<string>) — brand-level legal appended on top of brief disclaimers.
- `brandColor` (string/color), `logo` (image) — used by preview renderers for brand-accurate mocks.

### `mergeField` (document, config — seeded, the token registry)
Defines every placeholder the AI is allowed to emit and how it resolves. This is what lets generated copy reference data that may not live in Sanity.
- `key` (string, required, unique — e.g. `product.name`, `product.price`, `cart.recoveryUrl`, `cart.itemCount`, `customer.firstName`, `offer.amount`). Token form in content is `{{key}}`.
- `label` (string) — human label for the editor.
- `source` (string, list: `external` | `sanity`) — where it resolves from. `external` = a downstream commerce/PIM/CRM system at delivery time; `sanity` = a field/doc inside Sanity.
- `sampleValue` (string) — the value used to render previews (simulates the live external lookup), e.g. `iPhone 16 Pro`, `$30`.
- `sanityResolver` (string, optional, only for `source:'sanity'`) — GROQ/path used to pull the live value from Sanity, e.g. `featuredProduct->price` or `offer`.
- `description` (text) — guidance the AI sees so it uses the token correctly.

### `product` (document, optional — a lightweight Sanity-side product stub)
Exists so the demo can show the **same** `{{product.*}}` token resolving from **Sanity** when a brief sets `featuredProduct`, vs. from the external sample when not.
- `name` (string), `price` (string), `image` (image), `shortDescription` (text), `productUrl` (url).
> In reality AT&T product data lives in a commerce/PIM system; this stub demonstrates the Sanity-resolved path without claiming Sanity owns the catalog.

### `contentVariation` (document) — one generated cell per (brief × [flow step] × channel × segment)
- `_id`: **deterministic** = `variation.${briefId}.${stepKey}.${channelKey}.${segmentKey}` (briefId stripped of `drafts.`; `stepKey` = `default` for promotional campaigns). Published id so the matrix and App SDK read the same doc with no perspective dance.
- `brief` (reference→`campaignBrief`, required).
- `flowStep` (string, optional — `default` for promotional, else the `flowStep.stepKey`).
- `channel` (string `web|email|sms`, denormalized discriminator) + `channelRef` (reference→`channel`).
- `segment` (string, denormalized) + `segmentRef` (reference→`segment`).
- `status` (string, readOnly: `pending` | `generating` | `generated` | `error`).
- `generatedAt`, `generatedFromBriefRev` (string, readOnly) — provenance; drives the "out of date" badge when `generatedFromBriefRev !== brief._rev`.
- `web` (object `webContent`), `email` (object `emailContent`), `sms` (object `smsContent`) — **only the matching channel object is populated**; others hidden. Generate's `target.path` guarantees only one is written.

**Decision: ONE discriminated `contentVariation` type, NOT three per-channel doc types.** Rationale: one Generate call targets one schema + scopes writes via `target:{path:['web']}`; the matrix query returns all 12 rows uniformly; one Studio preview view; deterministic ids stay simple. Channels are fixed (3) with fixed shapes, so embedding beats fragmentation. Keep each channel object a **named object type** so it's individually reusable/previewable.

### Channel content object shapes
- **`webContent`**: `headline` (string, req), `subheadline` (string), `body` (Portable Text, text-only block style), `ctaLabel` (string), `ctaUrl` (url), `heroImage` (image, hotspot, `alt` subfield + `options.aiAssist.imageInstructionField:'imagePrompt'` + hidden `imagePrompt` text field).
- **`emailContent`**: `subjectLine` (string, req, `rule.max(60).warning()`), `preheader` (string, `rule.max(110).warning()`), `body` (Portable Text), `ctaLabel` (string), `ctaUrl` (url).
- **`smsContent`**: `message` (text, req, `rule.max(160).error('SMS must be ≤160 characters.')`), `link` (url).

> After any schema change run `npx sanity schema deploy` and re-capture `schemaId` — Generate validates against the deployed schema. Single workspace → `schemaId = '_.schemas.default'`.

---

## Placeholders / merge-field tokens

Personalized campaigns reference data Sanity does not own — live product details, the customer's cart, their first name. Rather than have the AI invent these (and risk wrong prices/names), generated copy emits **tokens** (`{{key}}`) drawn from the `mergeField` registry. Tokens stay as literal text in the stored `contentVariation` and are **resolved later** — at preview time in the demo, at delivery time in production — either from an **external system** or, when the data lives in Sanity, from **Sanity content**.

This mirrors the reference demo's proven inline-token pattern (`vehicleValue` inline blocks resolving from a `vehicleModel` doc) — generalized to also cover external sources.

### How the AI uses tokens
The Generate `instruction` is given the available token list (key + description) via `instructionParams` and told: *"For product, pricing, cart, and customer-specific values you do not own, insert the exact token `{{key}}` — never invent these values."* So Generate writes the marketing *frame* and drops in tokens for the volatile data.

### Resolution
A pure util `resolveTokens(text, {brief, client, sampleMode})` walks `{{…}}` tokens and replaces each:
- **`source: 'external'`** → the `mergeField.sampleValue` (demo) — represents a live commerce/PIM/CRM lookup at send time.
- **`source: 'sanity'`** → the live value via `mergeField.sanityResolver` against Sanity content (e.g. `offer` from the brief, or `featuredProduct->price` when the brief references a Sanity `product`).
- **Unresolved** → rendered as a highlighted chip so it is visually obvious in preview which values are merge fields. Preview components color-code Sanity-resolved vs external-resolved tokens.

### Worked example — abandoned-cart SMS (Value / Cricket segment)

**Stored (generated) `smsContent.message`** — tokens intact:
```
Still thinking it over? Your {{product.name}} is in your cart. Finish up and save {{offer.amount}} — {{cart.recoveryUrl}}. Txt STOP to opt out.
```

**Token resolution:**
| Token | Source | Resolves to |
|---|---|---|
| `{{product.name}}` | external (commerce/PIM) | `Cricket Icon 5` |
| `{{offer.amount}}` | **Sanity** (`campaignBrief.offer`) | `$30` |
| `{{cart.recoveryUrl}}` | external (cart service) | `https://cricketwireless.com/cart/abc123` |

**Rendered preview:**
```
Still thinking it over? Your Cricket Icon 5 is in your cart. Finish up and save $30 — https://cricketwireless.com/cart/abc123. Txt STOP to opt out.
```

### Worked example — the *same* placeholder resolved by Sanity content
When the brief sets `featuredProduct` (a Sanity `product` doc), the **identical** `{{product.name}}` / `{{product.price}}` tokens resolve from **Sanity** instead of the external sample — the registry entry's `source` effectively flips to `sanity` for that brief and uses `sanityResolver: featuredProduct->name`. Same token, same generated copy, data now sourced from Sanity. This is the "placeholder replaced by Sanity content" demonstration: Sanity acts as the orchestration layer whether the data lives inside or outside it.

---

## AI generation pipeline

### Module layout (mirrors `translate/orchestrate.ts` + `agentTranslate.ts`)
```
studio/src/plugins/personalization/generate/
├── agentGenerate.ts    # ONLY file touching client.agent.action.generate (@beta vX)
├── orchestrate.ts      # generateMatrix(client,{briefId,channels,segments,steps,onProgress})
├── promptAssembly.ts    # pure: build {instruction, instructionParams, withImage}
├── tokens.ts           # pure: resolveTokens(text,{brief,client,sampleMode}) + token chip metadata
├── ids.ts              # variationId(briefId,step,channel,segment) + parse
└── *.test.ts           # pure unit tests (promptAssembly, tokens, ids, orchestrate w/ mock client)
```
Both the App SDK app and the Studio document action import `orchestrate.ts` (App SDK passes `useClient()`; Studio passes its client) — identical to how `hq-rollout` app + tool both call the shared translate logic.

### The isolated wrapper (`agentGenerate.ts`)
```ts
export const AGENT_ACTION_API_VERSION = 'vX'
export const AGENT_SCHEMA_ID = '_.schemas.default'

export async function agentGenerateVariation(client, {targetId, channel, instruction, instructionParams, withImage}) {
  const agent = client.withConfig({apiVersion: AGENT_ACTION_API_VERSION})
  const target = withImage
    ? [{path: [channel]}, {path: [channel, 'heroImage', 'asset']}]
    : {path: [channel]}
  return agent.agent.action.generate({
    schemaId: AGENT_SCHEMA_ID,
    targetDocument: {operation: 'create', _id: targetId, _type: 'contentVariation'},
    instruction,
    instructionParams,
    target,
  })
}
```

### Instruction + instructionParams (`promptAssembly.ts`, pure)
All variable content flows through `instructionParams` (docs-recommended) — not string concatenation. Per cell:
```ts
instruction: `You are writing $channelTitle marketing copy for the $brand brand, targeting "$segmentTitle".
Campaign brief: $brief
$flowStepLine
Offer: $offer
Must include key messages: $keyMessages
Brand voice: $brandVoice
Audience profile: $segmentProfile
Channel constraints (MANDATORY): $channelConstraints
Include these disclaimers verbatim, unedited: $disclaimers
For product, pricing, cart, and customer-specific values you do NOT own, insert the exact token (e.g. {{product.name}}) — never invent these values. Available tokens: $tokens
Write only the $channel content fields; stay within all length limits.
${withImage ? 'Also generate a hero image matching the headline and brand.' : ''}`
instructionParams: {
  channelTitle:{type:'constant',value:channel.title}, channel:{type:'constant',value:channel.key},
  brand:{type:'constant',value:brandName(segment.brand)}, segmentTitle:{type:'constant',value:segment.title},
  brief:{type:'document',documentId:briefId}, offer:{type:'constant',value:brief.offer??''},
  keyMessages:{type:'constant',value:(brief.keyMessages||[]).join('; ')},
  brandVoice:{type:'constant',value:segment.brandVoice}, segmentProfile:{type:'constant',value:segment.audienceProfile},
  channelConstraints:{type:'constant',value:channel.constraints},
  disclaimers:{type:'constant',value:allDisclaimers(brief,segment).join('\n')},
  // tokens: the merge-field registry rendered as "key — description" lines
  tokens:{type:'constant',value:mergeFields.map(m=>`{{${m.key}}} — ${m.description}`).join('\n')},
  // flow step intent, only for abandoned-cart campaigns (empty string otherwise)
  flowStepLine:{type:'constant',value:step ? `This is the "${step.stepKey}" step (${step.delayLabel}). Intent: ${step.intent}` : ''},
}
```
`withImage = channel.key === 'web'`. The AI inserts tokens like `{{product.name}}`; resolution happens later via `resolveTokens` (see Placeholders).

### Orchestration loop (`orchestrate.ts`)
`generateMatrix(client, {briefId, channels?, segments?, steps?, onProgress})`:
1. Fetch brief + targeting. **Cell set depends on `campaignType`**: promotional → channels × segments (step = `default`, 12 cells); abandoned-cart → for each `flowStep`, its `step.channels` × segments (e.g. 3 steps × ~2 channels × 4 segments).
2. **Serial** loop over selected cells (Agent Actions are `@beta`, credit/rate-sensitive): for each — `createOrReplace` a placeholder `{status:'generating'}` (so the matrix shows live progress) → `agentGenerateVariation` → patch `{status:'generated', generatedAt, generatedFromBriefRev: brief._rev}`. On throw: patch `{status:'error'}` (keep the marker — it's the visible failure path). `onProgress({done,total,current})` drives the progress UI.
3. Return `{flowStep, channel, segment, status, id}[]`.

**Idempotency:** deterministic `_id` + `createOrReplace` placeholder before each Generate → re-runs overwrite cleanly, never accumulate duplicates. Generate uses `operation:'create'` against that id.

### Caveats (carry into demo runbook)
- `apiVersion:'vX'` is experimental — contained to `agentGenerate.ts`; a signature change touches one file.
- **AI credits**: 12 Generate calls + up to 4 web image generations per full run. App must allow selecting a channel/segment subset and per-cell regenerate to limit spend.
- **Image gen is async** — returned variation may have an unresolved `heroImage.asset`; previews must null-guard (mirror reference `SanityImage`) and show a spinner until resolved.
- **Schema must be deployed** before any Generate call.

---

## App SDK app (`apps/campaign-studio` + shared `studio/src/tools/campaignStudio/`)
Thin `App.tsx` shell mirrors `apps/hq-rollout/src/App.tsx`: `SanityApp config={[{projectId,dataset}]}` + `ThemeProvider(buildTheme + AT&T font)` + `ToastProvider` + `<Suspense>`. Shared UI lives under `tools/campaignStudio/` (so it can also embed as a Studio tool later).

**Views:**
1. **Brief list** — stat cards + one row per `campaignBrief` with coverage (cells generated / 12), filter/sort toolbar.
2. **Brief editor (create/edit)** — full `campaignBrief` form incl. channel/segment targeting multiselect. Write via `useClient().createOrReplace` (simplest) or document mutation hooks.
3. **Generate dialog** (`<Dialog>`) — channel×segment multiselect with "All" / "Needs attention" quick-selects, serial runner with live `done/total + current cell` progress, post-run "Open in matrix", clear empty/error states. Re-entrancy-guarded.
4. **Variation matrix** — 4×3 (segment × channel) grid; each cell = channel mock (below) + status pill + "Regenerate this cell" + "Open in Studio" deep-link.

**`@sanity/sdk-react` hooks:** `useClient({apiVersion})` (fetch matrix, createOrReplace, delete, `.withConfig({apiVersion:'vX'}).agent.action.generate`); `useCurrentUser()` (provenance); `useNavigateToStudioDocument(handle, preferredStudioUrl)` for deep-links — resolve workspace url via `useStudioWorkspacesByProjectIdDataset()`, wrap in `<Suspense>` (reference gotcha). Matrix fetch via `useClient().fetch(MATRIX_QUERY)` with `defineQuery` + app-local typegen.

**`@sanity/ui` rules (from reference):** size text via `size` props (never inline `fontSize`); truncate via `textOverflow="ellipsis"`; no `<Drawer>` (compose `Layer`+`Portal`); layout via `Box`/`Card`/`Flex`/`Stack`/`Grid`.

---

## Studio preview (channel × segment matrix)
**A custom document view on `campaignBrief`** (a "Variations" tab via `defaultDocumentNode`) — the matrix is *about one brief*, so it belongs as a document view (like the reference's SEO/insights views), not a top-nav tool. Fetches `*[_type=="contentVariation" && brief._ref==$id]`. For **promotional** campaigns it renders a 4-row (segment) × 3-col (channel) grid; for **abandoned-cart** it adds a flow-step dimension (one grid per step, or step as tabs). Each cell delegates to a **shared per-channel preview component** (also used by the App SDK matrix) and runs `resolveTokens` so previews show merged copy:
- `WebHeroCard` — full-bleed hero mock: null-guarded `heroImage`, headline/subheadline overlay, rectangular CTA, brand-colored.
- `EmailClientMock` — inbox chrome: From (brand) / `subjectLine` / greyed `preheader` / body / CTA.
- `PhoneSmsBubble` — phone frame + SMS bubble with `message`, character counter (red if >160), `link`.
- **Token display toggle** per cell: switch between *raw* (tokens shown as highlighted chips, Sanity-resolved vs external color-coded) and *merged* (tokens resolved). Makes the placeholder mechanism explicit in the demo.
- Each cell: status chip + "out of date" badge when `generatedFromBriefRev !== brief._rev`.

Components live in `studio/src/tools/campaignStudio/components/previews/`.

---

## Build plan (7 incremental passes)
One commit per pass; gate each on `tsc` + build + manual smoke. Mirrors the reference's pass-based plan.

| # | Deliverable | Risk |
|---|---|---|
| 1 | Bootstrap project (new Sanity project + dataset, Studio scaffold from reference stack). Schemas: `campaignBrief` (incl. `campaignType` + `flowSteps`), `channel`, `segment`, `mergeField`, `product`, `contentVariation` + 3 channel objects. Deploy schema; capture `schemaId`. | Low |
| 2 | Seed config via MCP: 3 channels, 4 segments (w/ brand profiles + logos), the `mergeField` token registry, 1 Sanity `product`, and 2 briefs (1 promotional + 1 abandoned-cart with flow steps). Publish config before briefs reference it. | Low (blocks everything; get `key` discriminators + token keys exact) |
| 3 | **Pure generation core**: `ids.ts`, `tokens.ts` (resolveTokens), `promptAssembly.ts` (incl. token + flow-step injection), `agentGenerate.ts`, `orchestrate.ts` (promotional + abandoned-cart cell sets) + unit tests (mock client). | **HIGH — live Agent Actions Generate wiring (vX, target scoping, image async, idempotent create)** |
| 4 | Studio document action "Generate variations" on `campaignBrief` calling `orchestrate.ts` (the guaranteed manual path). | Medium |
| 5 | Studio "Variations" document view + per-channel preview components (web/email/SMS mocks) + token raw/merged toggle + flow-step dimension. | Medium |
| 6 | App SDK app: brief list, editor (promotional + abandoned-cart flow steps), generate-with-progress dialog, matrix preview w/ token toggle; reuses `orchestrate.ts`. | Medium (App SDK auth/nav/Suspense gotchas) |
| 7 | Seed pre-generated fallback variations (promotional 12-cell + abandoned-cart flow set, tokens intact) so demo works credit-free/offline; AT&T/Cricket/FirstNet branding polish. | Low |

**De-risking pass 3 (highest risk):**
- Pure tested modules first (`promptAssembly`/`ids`/`orchestrate` against a mock client); only `agentGenerate.ts` touches `vX`.
- Manual Studio document action (pass 4) is the **guaranteed demo path**, proven before the app is built.
- Optional Sanity Function trigger (auto-generate on brief publish) is **deferred** — auth-gated deploy + loop-care, same deferral as the reference's Function. Manual button + app are the shipped triggers.
- Seeded fallback variations (pass 7) so the matrix renders fully even without live AI credits.

---

## Seeding (via Sanity MCP)
Use `create_documents` (capture ids for refs) + `publish_documents` (publish config before briefs reference it) + `generate_image`:
- **3 `channel`** docs (`web`/`email`/`sms`) with `title`, `constraints`, SMS `maxLength:160`.
- **4 `segment`** docs with brand + profile + tone + `brandColor` + AI-generated `logo`: `new`→AT&T (aspirational), `loyal`→AT&T (appreciative/premium), `business`→FirstNet (mission-critical, eligibility disclaimer), `value`→Cricket (playful/budget).
- **`mergeField` token registry**: `product.name`, `product.price` (external + a `sanity` resolver for the Sanity-product example), `cart.recoveryUrl`, `cart.itemCount`, `customer.firstName`, `offer.amount` (`sanity` → `offer`) — each with `sampleValue` and `description`.
- **1 `product`** Sanity stub (e.g. "iPhone 16 Pro") so the Sanity-resolved token example works.
- **2 `campaignBrief`** docs: a **promotional** one ("Spring 5G Upgrade") and an **abandoned-cart flow** ("Cart Recovery — Phone Upgrade") with 3 `flowSteps` (reminder / incentive / urgency) across email + SMS, targeting all segments. Include `mandatoryDisclaimers`.
- **Optional fallback** `contentVariation` sets (`status:'generated'`, tokens intact, AI hero images) for both briefs so the matrix renders without live AI credits.

---

## Verification
1. **Schema/typegen**: `npx sanity schema deploy` succeeds; `schemaId` captured; `tsc` clean across studio + app.
2. **Pure core**: unit tests for `promptAssembly`, `tokens` (resolveTokens — external sample, Sanity resolver, unresolved chip), `ids`, `orchestrate` (mock client) pass — including idempotent re-run (no duplicate cells) and `error` status on thrown Generate.
3. **Live generation (Studio action)**: on the promotional brief, "Generate variations" produces 12 `contentVariation` docs; web cells get a hero image (after async resolve); SMS `message` ≤160; disclaimers verbatim; generated copy contains `{{tokens}}` for product/cart/customer data (not invented values); each cell `status:'generated'` with `generatedFromBriefRev`.
4. **Abandoned-cart flow**: on the abandoned-cart brief, generation produces variations per flow step × channel × segment; later steps escalate (reminder → incentive → urgency); cart/product tokens present.
5. **Tokens / placeholders**: matrix raw view shows tokens as chips; merged view resolves `{{offer.amount}}` from Sanity (brief) and `{{product.name}}`/`{{cart.recoveryUrl}}` from external samples; setting `featuredProduct` flips `{{product.*}}` to resolve from the Sanity `product` doc.
6. **Studio matrix**: "Variations" tab shows the grid (+ flow-step axis for abandoned-cart); each mock renders; editing the brief flips cells to "out of date".
7. **App SDK app**: create a new brief from scratch (both types, incl. flow steps) + edit an existing one; trigger generation with live progress; matrix preview + token toggle render; "Open in Studio" deep-link + per-cell regenerate work.
8. **Demo dry-run**: full flow (write brief → generate → preview matrix with token resolution) on promotional + abandoned-cart briefs across AT&T/FirstNet/Cricket; confirm fallback set renders if credits are unavailable.

## Open items / future (out of v1 scope)
- Content Agent API chat-based brief assistant (conversational brief refinement).
- Sanity Function auto-generation on brief publish.
- Public Next.js frontend rendering live personalized experiences.
- RBAC roles (marketer vs reviewer/legal approval) — kept minimal in v1.
