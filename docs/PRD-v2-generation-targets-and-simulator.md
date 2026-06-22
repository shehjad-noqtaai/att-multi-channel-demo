# PRD v2 — Flexible generation targets, frontend perspective switching & the Audience Simulator

> Build-ready PRD for three additive changes to the AT&T multi-channel personalization demo.
> Extends `docs/PRD.md`, `docs/HANDOVER.md`, and `docs/PLAN-storefront-frontend.md`.
> **Last updated:** 2026-06-22 · **Branch:** `main`

## Context

The demo today has three fixed behaviors that this PRD makes flexible:

1. **Generation always writes to a content release** attached to the brief
   (`generationReleaseId`). Variations land as version documents
   (`versions.${releaseId}.${variationId}`) and the marketer publishes/discards the whole
   batch atomically. There is no way to generate "quick draft" variations without spinning
   up a release. — `studio/src/personalization/generate/orchestrate.ts`,
   `studio/src/personalization/generate/releases.ts`.
2. **The storefront only ever reads the `published` perspective** — hardcoded in
   `apps/storefront/src/sanity/client.ts:16`, with the GROQ layer additionally filtering
   `status == "generated"` (`apps/storefront/src/sanity/queries.ts`). You cannot preview a
   staged release on the live frontend, so demoing unpublished work means publishing first.
3. **Personalization is selected via flat persona pills** — the "Campaign:" +
   "Preview as:" bar (`PersonaPreviewPicker.tsx`, `CampaignPreviewPicker.tsx`) drives a
   single `persona`/`campaign` query param. Merge-field tokens (`customer.firstName`,
   `cart.itemCount`, …) render from each `mergeField` doc's static `sampleValue`; there is
   no way to vary the simulated user.

This PRD addresses all three with minimal, additive change. **Scope is demo-quality**:
optimize for a compelling, reliable demo path, not production hardening.

### Decisions locked

| Decision | Choice |
|---|---|
| Generation target | Marketer chooses **per generation run**: "Release (attached to brief)" *(default, current behavior)* or "Drafts". |
| Draft target shape | Variations written to `drafts.${variationId}` using the existing deterministic IDs — no release created/touched. |
| Frontend perspective | A **preview control** lets the viewer pull content from **Published** *(default)* or a **specific release version**. Drafts viewing is included (a release is just a named perspective). |
| Frontend gating | Preview perspective is **token-gated** (read token + a preview flag), not exposed to anonymous public traffic. |
| Simulator | The persona pill bar is **replaced by an Audience Simulator panel**: segment + editable user-detail inputs that drive both variation selection *and* live merge-token values. |
| Simulator URL state | Encoded in query params (extends today's `persona`/`campaign`) so previews stay shareable/linkable. |

---

## Feature 1 — Generation target toggle (Release vs Drafts)

### Goal
Let the marketer decide, at generate time, whether variations are staged into the brief's
content release (review-then-publish-atomically) or written straight to drafts (fast,
informal iteration that shows up in the Studio draft pane and the App SDK matrix).

### Current behavior (reference)
- `GenerateDialog.tsx` (App SDK) and `actions/generateVariations.tsx` (Studio) invoke
  `generateMatrix()` in `orchestrate.ts`.
- `orchestrate.ts` resolves/creates a release via `resolveBriefReleaseId()` and writes each
  cell with `upsertVersion()` → `versions.${releaseId}.${variationId}`
  (`releases.ts:128-155`).
- Review/publish/discard happens in `MatrixView.tsx` (`publishBriefRelease` /
  `discardBriefRelease`).

### Changes

**1.1 — Generation target parameter.**
Add a `target: 'release' | 'drafts'` option threaded from the UI into `generateMatrix()`.
Default `'release'` to preserve current behavior.

- `orchestrate.ts`: branch the write step.
  - `target === 'release'` → existing path (`resolveBriefReleaseId` + `upsertVersion`).
  - `target === 'drafts'` → new `upsertDraft()` writing `createOrReplace` to
    `drafts.${variationId}`. **Do not** resolve or mutate `generationReleaseId`.
- The generated-doc assembly (strip system fields, status pin `generating→generated`, hero
  image assignment, offer-URL injection — `orchestrate.ts:290-341`) is shared; only the
  final write differs. Factor the target-specific write behind a small
  `writeVariation(doc, {target, releaseId})` helper.

**1.2 — `releases.ts` companion.**
Add `upsertDraft(client, variationDoc)` next to `upsertVersion()`, using
`client.createOrReplace({_id: 'drafts.' + variationId, ...})`. Keep release helpers
untouched.

**1.3 — UI toggle.** In `GenerateDialog.tsx` add a segmented control / radio:
> **Generate into:** ( • Release — review & publish together ) ( ○ Drafts — quick iteration )

with one-line helper text per option. Mirror the same control in the Studio
`generateVariations.tsx` action (a dialog or a two-variant action: "Generate into release"
/ "Generate as drafts").

**1.4 — Brief default (optional, nice-to-have).** Add `defaultGenerationTarget`
(`'release' | 'drafts'`, default `'release'`) to `campaignBrief` schema so a brief can
preselect the toggle. The run-time UI choice always wins.

**1.5 — Matrix awareness.** `MatrixView.tsx` currently reads through the release
perspective. When variations were generated as drafts there's no release to publish.
- Detect target by which docs exist (`drafts.*` vs `versions.${releaseId}.*`) or store a
  read-only `lastGenerationTarget` on the brief.
- When the latest run targeted drafts: hide/disable "Publish release" / "Discard release",
  show a "Drafts" badge, and offer a secondary "Publish drafts" action
  (`client.createOrReplace` of the published doc from each draft, or per-doc publish).

### Acceptance criteria
- Toggling to **Drafts** and generating creates `drafts.variation.*` docs, creates **no**
  release, and leaves `generationReleaseId` unchanged.
- Toggling to **Release** (default) reproduces today's behavior exactly.
- The matrix renders generated cells in both modes; release-only controls are hidden in
  drafts mode.
- Re-running with the same brief + target is idempotent (deterministic IDs overwrite).

---

## Feature 2 — Frontend perspective switcher (Published vs Release version)

### Goal
On the storefront, let a previewer pull content from **Published** (what customers see) or
from a **named release/version perspective** (staged, not yet live) — so a release can be
demoed on the real frontend before publishing.

### Current behavior (reference)
- `apps/storefront/src/sanity/client.ts:16` hardcodes `perspective: 'published'`,
  `useCdn: !readToken`.
- `WEB_VARIATION_QUERY` filters `status == "generated"` (`queries.ts:12`).
- No draft/release visibility by design (comment at `client.ts:4-6`).

### Changes

**2.1 — Perspective-aware client.**
Introduce a request-scoped client factory:
`getClient(perspective: 'published' | string)` where a non-`published` value is a **release
ID** (Sanity accepts release IDs as perspectives, layering version docs over published).
- Use `useCdn: false` and the read token whenever `perspective !== 'published'` (CDN can't
  serve non-published perspectives).
- Keep the default published client (CDN-backed) for normal traffic.

**2.2 — Relax the status filter for preview.**
`status == "generated"` excludes in-progress release content. For preview perspectives,
broaden to `status in ["generated"]` *or* drop the status filter (release version docs are
trustworthy because the marketer staged them). Parameterize the query so published traffic
keeps the strict filter and preview traffic sees staged cells. Keep the
`flowStep`/`generatedAt` ordering intact.

**2.3 — Preview control + gating.**
Add a **Perspective** selector to the preview chrome (alongside the Simulator from Feature
3): "Published" + a list of available releases. Source the release list from the Releases
API (server action / route handler using the read token), labeling each by title.
- Encode selection in a `perspective` query param (`published` default, else release ID).
- **Gate it:** only render the control and honor a non-published `perspective` when a
  preview flag is present (e.g. `SANITY_API_READ_TOKEN` set **and** a `preview` cookie/flag
  or a signed query param). Anonymous production traffic always gets `published`.

**2.4 — Wiring.**
- `app/page.tsx` and `app/offer/[brief]/[persona]/page.tsx` read `perspective` from
  `searchParams`, build the right client via `getClient()`, and pass it down through
  `resolvePersonalizedSlot.ts` (which currently imports the singleton client — thread the
  client in instead).
- Surface a small "Previewing: <release title>" banner when not on published, so the demo
  audience knows what they're looking at.

### Acceptance criteria
- Default visit (no flag) is unchanged: published-only, CDN, strict status filter.
- With preview enabled, selecting a release renders that release's staged web variations on
  the live storefront **without** publishing.
- Switching back to Published instantly returns to live content.
- A release that has no variation for the selected segment falls back to the static slot
  (same fallback path as today).

---

## Feature 3 — Audience Simulator (replaces the persona pill bar)

### Goal
Replace the flat "Campaign / Preview as" bar with an **Audience Simulator**: the previewer
picks a **segment** *and* edits **user details** (the merge-field inputs), and the page
re-resolves both the matching variation **and** the live token values — so the same
variation visibly personalizes for different simulated users.

### Current behavior (reference)
- `PersonaPreviewPicker.tsx` / `CampaignPreviewPicker.tsx` set `persona` / `campaign` query
  params; `page.tsx:26-43` parses them.
- `personas.ts` is the static persona registry (`new` / `loyal` / `business` / `value`).
- Tokens resolve from each `mergeField` doc's static `sampleValue` (`queries.ts:31-33`,
  `resolvePersonalizedSlot.ts:48-80`, `mergeText()`).

### Changes

**3.1 — Simulator panel UI.** New `components/home/AudienceSimulator.tsx` replacing the two
pickers. Layout:
- **Campaign** selector (unchanged options: Trade-in / Abandoned cart).
- **Segment** selector (the four personas — keep the colored brand styling from
  `personas.ts`).
- **User details** — editable inputs for the known merge fields, seeded from each
  `mergeField`'s `sampleValue` as the placeholder/default:
  - `customer.firstName` (text)
  - `cart.itemCount` (number) · `cart.recoveryUrl` (read-only/derived)
  - `product.name`, `product.price`, `offer.amount`
  - Render inputs **dynamically from the fetched `mergeField` docs** (don't hardcode), so
    adding a merge field in Studio surfaces a new input automatically. Use `label` for the
    field name and `description` as helper text.
- A "Reset to samples" affordance.

Style it as a collapsible "Simulator" panel/drawer in the preview chrome so it doesn't
dominate the page; the live page renders beneath/beside it.

**3.2 — State & URL encoding.** Extend query params:
- `campaign`, `persona` (existing).
- `sim` — a compact encoding of overridden user-detail values (e.g. base64 or
  `key:value;` pairs of only the fields the user changed). Unset fields fall back to
  `sampleValue`. Keeps previews shareable.

**3.3 — Token resolution from simulator values.** `resolvePersonalizedSlot.ts` /
`mergeText()` currently merge from `sampleValue`. Add an override map sourced from the
simulator (`sim` param) that takes precedence over `sampleValue` per token key. Resolution
order: **simulator override → `sanityResolver` (if `source === 'sanity'`) → `sampleValue`**.

**3.4 — Segment still drives variation selection.** `persona`/segment continues to select
the `contentVariation` via `WEB_VARIATION_QUERY` (`segment == $persona`). The simulator's
user-detail inputs **do not** change which variation is fetched — they change the **token
values merged into it**. (Segment = which copy; user details = the dynamic blanks.) Document
this clearly in the panel so the demo narrative is crisp.

**3.5 — Composition with Feature 2.** The Simulator and the **Perspective** selector
(Feature 2.3) live in the same preview chrome. The page resolves: chosen perspective →
fetch variation for segment → merge tokens with simulator overrides.

### Acceptance criteria
- Selecting a segment changes the rendered variation (existing behavior preserved).
- Editing `customer.firstName` (etc.) live-updates the rendered headline/body tokens
  without changing which variation is shown.
- Inputs are generated from the live `mergeField` docs; adding one in Studio adds an input.
- Simulator + segment + campaign + perspective state is fully reconstructable from the URL.
- With no overrides, output is identical to today's `sampleValue`-based rendering.

---

## Cross-cutting / non-goals

- **No schema rewrite.** `contentVariation`, `segment`, `channel`, `mergeField`,
  `campaignBrief` keep their shapes. New fields are additive and optional
  (`defaultGenerationTarget`, optional `lastGenerationTarget`).
- **Deterministic IDs unchanged** — `variation.${briefId}.${stepKey}.${channelKey}.${segmentKey}`
  is reused for the draft target (`drafts.${that}`).
- **Generation core stays shared** between Studio and App SDK; only the write-target branch
  and the dialog control are new.
- **Out of scope:** real CRM/commerce lookups for tokens (still simulated), auth/SSO for
  preview gating beyond the token+flag check, per-user analytics, A/B measurement.

## Suggested build order

1. **F1.1–1.3** — generation target toggle + `upsertDraft` (backend-light, high demo value).
2. **F1.5** — matrix awareness for drafts mode.
3. **F2.1–2.4** — perspective-aware storefront client + preview control + gating.
4. **F3.1–3.4** — Audience Simulator (depends on nothing in F1/F2; can be parallelized).
5. **F3.5** — compose Simulator + Perspective in shared preview chrome.

## Key files to touch

| Area | Files |
|---|---|
| Generation target | `studio/src/personalization/generate/orchestrate.ts`, `.../releases.ts`, `apps/campaign-studio/src/views/GenerateDialog.tsx`, `studio/src/actions/generateVariations.tsx`, `apps/campaign-studio/src/views/MatrixView.tsx`, `studio/src/schemaTypes/documents/campaignBrief.ts` |
| Frontend perspective | `apps/storefront/src/sanity/client.ts`, `.../queries.ts`, `apps/storefront/src/lib/resolvePersonalizedSlot.ts`, `app/page.tsx`, `app/offer/[brief]/[persona]/page.tsx` |
| Simulator | `apps/storefront/src/components/home/AudienceSimulator.tsx` (new, replaces `PersonaPreviewPicker.tsx` + `CampaignPreviewPicker.tsx`), `apps/storefront/src/lib/personas.ts`, `apps/storefront/src/lib/resolvePersonalizedSlot.ts`, `apps/storefront/src/sanity/queries.ts` |
