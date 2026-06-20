# Campaign Studio (App SDK) — Code Handover

> **Scope:** Current state of the **App** (`apps/campaign-studio`, the Sanity App SDK
> marketer interface) plus the shared generation/preview code it depends on, followed by
> the prioritized backlog of next things to implement.
>
> **Last updated:** 2026-06-20 · **Branch:** `main`

---

## 1. What the App is

`apps/campaign-studio` is a thin **Sanity App SDK** application aimed at marketers. It is a
single-page React app (Vite + `@sanity/sdk-react`) that lets a marketer:

1. Browse / create / edit **campaign briefs** (single-step "promotional" or multi-step
   "abandoned-cart" flows).
2. **Generate** per-channel × per-segment content variations from a brief using Sanity
   **Agent Actions** (the LLM call), staged into a **content release**.
3. **Preview** every variation in a matrix using channel-accurate mockups (web hero, email
   client, SMS phone bubble) with a raw/merged token toggle.
4. **Review and publish** the staged release (or discard it), edit individual cells,
   archive/restore, and delete campaigns.

It shares its generation core and preview components with the **Studio** (`studio/`) so both
surfaces produce and render identical output — no duplicated logic.

### Tech stack (verified from `package.json`)

| | App (`apps/campaign-studio`) | Studio (`studio`) |
|---|---|---|
| Framework | App SDK — `@sanity/sdk-react` ^2.14, `@sanity/sdk` ^2.14 | `sanity` ^6.1 |
| Build | Vite ^5.4 + `@vitejs/plugin-react` | Sanity CLI |
| React / TS | React 19.2 / TS 5.4 | React 19.2 / TS 5.4 |
| UI | `@sanity/ui` ^3.2, `@sanity/icons` | `@sanity/ui` ^3.2, `@sanity/assist` ^6 |
| Client | `@sanity/client` ^7.22 | `@sanity/client` ^7.22 |

- **Project:** `z6s0fz61` · **Dataset:** `production` · **Org:** `oab7ManMj` · **App ID:** `vjhgclbnnees2z5mkug5cctb`
- **Monorepo:** npm workspaces — `studio`, `apps/*`, `functions/*`.
- The App imports studio code via TS path aliases (`@studio/*` → `../../studio/src/*`),
  configured in `tsconfig.json` + a matching Vite `resolve.alias`. **Not** a published package.

---

## 2. App source map (`apps/campaign-studio/src`)

```
App.tsx                 Root: <SanityApp> provider + theme + Suspense
main.tsx                Vite entry
CampaignStudio.tsx      Top-level router (list | edit | matrix) + config loader
constants.ts            PROJECT_ID, DATASET, ATT_BLUE
theme.ts                @sanity/ui theme overrides
fonts.css / index.css   Styling (see note below)
queries.ts              GROQ: CONFIG_QUERY, BRIEF_LIST_QUERY, BRIEF_DETAIL_QUERY, MATRIX_QUERY
types.ts                ChannelDoc, SegmentDoc, MergeFieldDoc, CampaignBrief, VariationCell, …
env.d.ts                Vite env typings

views/
  BriefList.tsx         Campaign table + search/filter + stat cards + "Create"
  BriefEditor.tsx       Inline brief form (create/edit), incl. hero media picker
  GenerateDialog.tsx    Generation control panel: channel/segment/step multiselect + progress
  MatrixView.tsx        Variation grid, per-cell preview/edit, release banner + publish/discard
  VariationEditor.tsx   Per-cell edit dialog (auto-save), token-aware

components/
  AllowedMediaPicker.tsx   Pick from brief's allowed media assets
  MediaLibraryField.tsx    Browse/select Sanity Media Library assets
  OpenInStudioButton.tsx   Deep-link a doc into the Studio

hooks/
  useMediaLibraryAssets.ts Fetch Media Library assets
```

**Shared from Studio** (imported, single source of truth):
- `@studio/personalization/generate/*` — generation core (framework-agnostic, no React/Sanity-UI imports):
  `orchestrate.ts` (`generateMatrix`), `agentGenerate.ts` (Agent Actions `vX` wrapper — the **only** file touching that API), `promptAssembly.ts`, `tokens.ts`, `ids.ts`, `allowedMedia.ts`, `releases.ts`.
- `@studio/ui/campaign/previews/*` — `WebHeroCard`, `EmailClientMock`, `PhoneSmsBubble`, `TokenText`/`TokenLegend`, `HeroChannelPreview`, `previewCommon`.
- `@studio/ui/campaign/CellViewDialog` — full-size cell preview dialog.

---

## 3. How it works end-to-end

### Routing & config
`CampaignStudio.tsx` holds a `View` union (`list` | `edit` | `matrix`) in state and loads
`CONFIG_QUERY` once (channels, segments, mergeFields, products, mediaAssets) into `AppConfig`,
passed down to every view. `refreshTick` re-runs config after edits so newly-added media
assets reach the hero picker. IDs are canonicalized (`drafts.` stripped) before navigation.

### Content model (defined in `studio/src/schemaTypes`)
- **Documents:** `campaignBrief`, `contentVariation`, `channel`, `segment`, `mergeField`, `product`, `mediaAsset`.
- **Objects:** `flowStep`, `webContent`, `emailContent`, `smsContent`.
- **Seeded config:** 3 channels (web / email / sms, SMS `maxLength: 160`), 4 segments
  (new=AT&T, loyal=AT&T, business=FirstNet, value=Cricket), 6 merge fields, 1 product.
- A `contentVariation` is one matrix cell, keyed by `brief × [flowStep] × channel × segment`,
  holding a `web` / `email` / `sms` object plus `status`, `generatedAt`, `generatedFromBriefRev`.

### Generation (the LLM call)
`generateMatrix(client, {briefId, channels?, segments?, steps?, onProgress})`:
1. Fetches brief + channels + segments + merge fields + allowed media.
2. Plans the cell cross-product (× steps for multi-step briefs).
3. **Serially** calls `agentGenerateVariation` → Sanity **Agent Actions** `agent.action.generate`
   (`apiVersion: 'vX'`, `AGENT_SCHEMA_ID = '_.schemas.default'`, `noWrite: true`, target path
   scoped to the matching channel object). Prompt is built by `promptAssembly.buildPrompt`
   (brand voice, audience profile, channel constraints, verbatim disclaimers, available tokens).
4. Picks a hero image from allowed media; writes the result as a **version document into a
   per-brief content release** (`releases.ts`, `RELEASES_API_VERSION = '2025-02-19'`).
5. Emits `onProgress` events (`{done, total, current}`) the `GenerateDialog` renders as a bar.

**Deterministic IDs** (`ids.ts`): `variation.<briefId>.<stepKey>.<channelKey>.<segmentKey>`
(stepKey `default` for promotional). Re-runs `createOrReplace` the same id → idempotent, no dupes.

**Tokens** (`tokens.ts`): `{{key}}` placeholders resolve from `mergeField` docs — external
tokens use `sampleValue`; Sanity tokens evaluate `sanityResolver`. When a brief has a
`featuredProduct`, `product.*` tokens flip to Sanity resolution. Previews show raw chips
(color-coded: blue=sanity, yellow=external, red=unresolved) or merged values via the toggle.

### Releases (review-before-publish)
The brief stores `generationReleaseId`. `MatrixView` reads the matrix through the release
perspective `[releaseId, 'drafts', 'published']` so staged-but-unpublished variations layer
over live content. A **caution banner** shows the pending count with **Publish release**
(`publishBriefRelease`) / **Discard** (`discardBriefRelease`). After promote/discard the
brief's `generationReleaseId` is cleared.

### Matrix view specifics
- Promotional → one grid; multi-step → stacked sections, one per flow step.
- Grid = segment rows × channel columns; each `MatrixCell` renders the channel-appropriate
  preview, a `StatusPill` (generated / generating / error / none), plus **Edit** / **View** /
  **Regenerate**. Badges: `Edited · draft` (un-approved draft edit) and `Out of date`
  (`cell.generatedFromBriefRev !== brief._rev`).
- **Archive** = batch-unpublish all variations + flag brief (reversible). **Delete** = hard
  delete brief + all variations (draft+published twins) in one transaction (no undo).
- Two clients are used: read client `apiVersion: '2024-11-12'`; write/generate client
  `apiVersion: 'vX'`.

### Env & run
- App `.env`: `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`.
- Studio `.env`: `SANITY_AUTH_TOKEN` (editor for generate/smoke; deploy-studio for hosting).
- App SDK **deploy** needs an **org-level token with "Manage SDK Apps"**.

```bash
npm run app:dev            # dev (sanity dev) → open via www.sanity.io/@oab7ManMj?dev=http://localhost:3333
npm run app:build          # tsc + vite build
npm --workspace campaign-studio run deploy   # deploy app (org token)
npm run studio:dev | studio:deploy-schema    # studio dev / schema deploy
npm run typecheck | test   # across workspaces (vitest covers generation core)
```

---

## 4. Current limitations / known gaps (state of play)

- **Releases are app-managed only.** The App creates/publishes its own per-brief release;
  it does **not** attach to or run an existing Sanity release selected elsewhere, and the
  attached release is not surfaced back into the brief document for editors.
- **Preview styling is `@sanity/ui`-based, not the real frontend.** Previews approximate the
  brand but do not consume the actual FE reference repo's CSS/tokens/fonts. `fonts.css` is a
  **placeholder** `@font-face` that falls back to Inter/system — the real woff2 was never
  swapped in (see the comment in `apps/campaign-studio/src/fonts.css`).
- **Generated copy can run long.** Standard legal/T&C text is emitted inline; there is no
  pattern to offload long legal/marketing text to a dedicated page and keep the offer concise.
- **SMS is capped at 160 chars** (`smsContent.message` validation `.max(160)` and
  `channel-sms.maxLength = 160`).
- **No standalone storefront/frontend** to actually render the chosen variation for a given
  person/segment.

---

## 5. Next things to implement (backlog)

> Ordered roughly by dependency. Each item lists the concrete touch points.

### 5.1 Tie current releases to "view releases" so they can be run from the App
- In the App SDK screen, list **existing Sanity releases** (via `releases::all()` /
  `list_releases`) and let the marketer **attach** a release to a brief instead of always
  auto-creating one, then **run generation into that attached release**.
- On attach, **auto-populate the release on the brief document** (`campaignBrief` already has
  `generationReleaseId`, `releaseTitle`, `releaseType` — write the selected release back so it
  shows in the brief editor and Studio).
- Touch points: new release-picker UI in `MatrixView`/`BriefEditor`; extend
  `studio/src/personalization/generate/releases.ts` (`resolveBriefReleaseId`) to accept a
  caller-provided release id; patch the brief on attach.

### 5.2 All App SDK previews use the real frontend styling + fonts
- Replace the `@sanity/ui` approximations in `WebHeroCard` / `EmailClientMock` /
  `PhoneSmsBubble` with the **FE reference repo's** styling tokens, components, and fonts.
- Swap the placeholder `fonts.css` for the real brand **woff2** files; align colors/spacing
  to the reference theme so Studio ↔ App ↔ live frontend match.
- Touch points: `studio/src/ui/campaign/previews/*`, `apps/campaign-studio/src/fonts.css`,
  `theme.ts`/`index.css`. Keep both surfaces sharing the same components.

### 5.3 Shorten output + route long legal/marketing copy to a dedicated page
- Update `promptAssembly.ts` so generated copy stays concise and **keeps the offer relevant**;
  long standard T&C / legal / marketing text should not be inlined.
- Instead, **link the user to a specific page** that hosts the legal + marketing text (the new
  frontend, item 5.5), keeping the channel message about the offer itself.
- Touch points: `promptAssembly.ts` (instruction + disclaimer handling), possibly a new
  content type / route for the legal/offer-detail page; CTA URL wiring.

### 5.4 SMS: raise the limit to 250 (but keep messages under it) + offer link
- Bump `smsContent.message` validation `.max(160)` → `.max(250)` and `channel-sms.maxLength`
  160 → 250; instruct generation to **stay under 250** and include a "View offer" (or
  context-appropriate) **web link** rather than full terms.
- Touch points: `studio/src/schemaTypes/objects/smsContent.ts`,
  `studio/src/schemaTypes/documents/channel.ts` (seeded `channel-sms`), `promptAssembly.ts`,
  `PhoneSmsBubble` preview.

### 5.5 Mock frontend application (Next.js)
- Build a **new Next.js app** (latest Next.js) that mirrors the **FE reference repo's styling
  and theming**, using the latest **`sanity`** + **`next-sanity`**.
- It should **render the relevant offer content on the web** for a chosen variation, and
  expose a **switcher** to view different **variations** and **personas/segments**.
- Serves as the destination for the SMS/email "View offer" links (item 5.3/5.4) and as the
  source-of-truth styling for the in-App previews (item 5.2).
- Touch points: new workspace under `apps/` (e.g. `apps/storefront`); reuse
  `contentVariation` data via GROQ; share preview/render logic with the previews where sensible.

---

## 6. Pointers

- **PRD / architecture:** `docs/PRD.md`, `docs/architecture.md`.
- **Seeded IDs:** `docs/SEED.md`. **Example briefs:** `docs/brief-*.md`.
- **Agent Actions API:** isolated in `studio/src/personalization/generate/agentGenerate.ts`
  (`apiVersion: 'vX'`). Re-verify the API shape + re-capture `AGENT_SCHEMA_ID` after any
  `sanity schema deploy`, then run `studio/scripts/smoke.ts` to confirm end-to-end generation.
