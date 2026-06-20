# Plan: `apps/storefront` — Next.js personalized offer landing pages

## Context

The AT&T multi-channel demo today has only a Studio + an App SDK app; there is **no
public-facing frontend**. The backlog (`docs/HANDOVER.md` §5) calls for a Next.js "mock
frontend" that renders the generated offer content on the web, with a switcher for
personas and variations, and serves as the destination for SMS/email "View offer" links.

The load-bearing requirement: **the content on a personalized page must come from the
`web`-channel `contentVariation` that matches the persona** (segment). The page
`/offer/[brief]/[persona]` resolves the published variation where `channel == "web"`,
`brief->slug.current == [brief]`, and `segment == [persona]` — so switching persona
genuinely re-fetches the matching variation.

**Locked decisions (from user):** scope = Next.js frontend + persona/variation switcher
**+** SMS/email deep-link wiring + SMS cap 160→250 + route long legal copy to a terms page;
routing = path-based `/offer/[brief]/[persona]`; data = **published only** (no draftMode);
styling = swappable theming layer with an AT&T-branded fallback now, real **FE reference
repo** (path/URL pending from user) ported in later; latest Next.js + `sanity`/`next-sanity`.

**Prerequisite / top risk:** published-only means a generation release must be **published**
before any offer page resolves (otherwise 404). Confirm published web variations exist
before demoing. The FE reference repo path is still **pending** — styling step uses the
AT&T fallback until it arrives.

## New workspace: `apps/storefront` (Next.js App Router)

```
apps/storefront/
  package.json  next.config.ts  tsconfig.json  .env.example  postcss.config.mjs
  src/
    app/
      layout.tsx  globals.css  page.tsx  not-found.tsx
      offer/[brief]/[persona]/
        page.tsx          # MAIN personalized page
        terms/page.tsx    # dedicated legal/T&C page
    sanity/   client.ts  env.ts  image.ts  queries.ts  tokens.ts
    components/ BrandShell  Hero  OfferBody  Cta  PersonaSwitcher  DisclaimerFooter  TermsView
    lib/  theme.ts  personas.ts  offerUrl.ts  portableText.ts
    types.ts
```

Mirrors the existing monorepo convention (`apps/*` workspace, `@studio/*` path alias).

## Key reuse (do NOT reimplement)

- **Token merging:** `studio/src/personalization/generate/tokens.ts` → `resolveTokens(text,
  {brief, mergeFields, client})`. It's pure/async, returns merged text (unresolved tokens
  left as `{{key}}`), handles external `sampleValue`, sanity `sanityResolver`, and the
  `featuredProduct` flip. The frontend wants **merged** output (no chips).
- **Hero image + body pattern:** `studio/src/ui/campaign/previews/HeroChannelPreview.tsx` /
  `previewCommon.ts` — if `heroImage.url` present use `${url}?w=640&fit=crop&auto=format`,
  else build from `heroImage.asset._ref` via `@sanity/image-url`. Body is plain block[] PT.
- **`@studio/*` alias + cross-dir include:** replicate from `apps/campaign-studio/tsconfig.json`.

## Implementation

### 1. Scaffold workspace
`package.json` (`next`, `react@19`, `next-sanity`, `@sanity/image-url`,
`@portabletext/react`), scripts `dev -p 3000` / `build` / `start` / `typecheck`. Add root
scripts `storefront:dev|build|start`. `.env.example`:
`NEXT_PUBLIC_SANITY_PROJECT_ID=z6s0fz61`, `NEXT_PUBLIC_SANITY_DATASET=production`,
`NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01`, `NEXT_PUBLIC_STOREFRONT_BASE_URL=http://localhost:3000`.

`next.config.ts`: `images.remotePatterns` for `cdn.sanity.io` + `*.sanity.io` (or render hero
with plain `<img>` to skip allowlisting — acceptable for a demo); **alias `@studio` →
`../../studio/src`** in both `webpack(config)` and `turbopack.resolveAlias` (NOT
`transpilePackages` — that only targets node_modules). `tsconfig.json`: `paths` `@studio/*`
+ explicit `include` of `../../studio/src/personalization/generate/tokens.ts`. **Validate
this import transpiles via a production `build`, not just `dev` — the top bundling risk.**

### 2. Sanity plumbing (`src/sanity/*`)
`client.ts`: `createClient({projectId, dataset, apiVersion, useCdn: true, perspective:
'published'})`. `image.ts`: `urlForHero(heroImage)` using the dual url/asset pattern.
`tokens.ts`: thin adapter `mergeText(text, brief, mergeFields)` calling `resolveTokens` with
the server client. `queries.ts` (`defineQuery`):

- **WEB_VARIATION_QUERY** (brief slug + persona): select `contentVariation` where
  `channel=="web" && segment==$persona && status=="generated" && brief->slug.current==$brief`,
  order `select(flowStep=="default"=>0,1) asc, coalesce(generatedAt,_updatedAt) desc)[0]`,
  project `web{headline,subheadline,body,ctaLabel,ctaUrl,heroImage{alt,url,asset}}`, the
  dereferenced `brief->{...offer, featuredProduct, mandatoryDisclaimers, slug}`, and the
  `segment` config doc (`*[_type=="segment" && key==^.segment][0]{...brandColor,logo,brandDisclaimers}`).
- **OFFER_INDEX_QUERY**: published briefs that have ≥1 published web variation, each with
  `personas: array::unique(...segment)` — drives the switcher + gallery (no dead links).
- **SEGMENTS_QUERY** / static `lib/personas.ts`: persona key→title/brandColor map.
- **TERMS_QUERY**: brief `mandatoryDisclaimers` + persona `brandDisclaimers` for the terms route.

### 3. Rendering
- **Strings** (headline/subheadline/ctaLabel): `await mergeText(...)`.
- **Portable Text body** (`lib/portableText.ts` + `OfferBody.tsx`): `resolveTokens` is async,
  PT React serializers are sync → **pre-resolve per-span on the server** (`mergeBlocks` maps
  blocks, resolves each `span.text`), then render with `@portabletext/react` `<PortableText>`
  + a components config styling normal/h2/h3/lists/strong/em and `marks.link`.
- **Theming (`lib/theme.ts`, `globals.css`, `BrandShell`):** CSS custom props
  (`--brand-primary` default `#00A8E0`); `themeForSegment(brandColor)` sets the var on a
  wrapper; components read `var(--brand-primary)`. When the FE reference repo arrives, port its
  tokens into `globals.css`, components into `components/`, woff2 via `next/font/local` in
  `layout.tsx` — swap is contained because chrome reads vars.

### 4. Routes
- `offer/[brief]/[persona]/page.tsx`: fetch WEB_VARIATION_QUERY + mergeFields → resolve →
  `<BrandShell><Hero/><OfferBody/><Cta/><DisclaimerFooter/></BrandShell>`; `notFound()` if no
  published web variation; `generateMetadata`; optional `generateStaticParams` from OFFER_INDEX.
- `offer/[brief]/[persona]/terms/page.tsx`: TERMS_QUERY → `<TermsView>` (offer line +
  mandatoryDisclaimers + brandDisclaimers). Linked from `DisclaimerFooter` "See full terms".
- `app/page.tsx`: gallery of briefs × available personas, each card tinted by `brandColor`.
- `PersonaSwitcher.tsx` (`"use client"`): brief select + persona pills (only available ones),
  each a `<Link prefetch>` to `/offer/[brief]/[persona]`; persona switch is a real navigation
  so content comes from the matching variation. Active pill uses that persona's `brandColor`.

### 5. Deep-link wiring + SMS cap (generation side)
- **Deterministic URL, not model-authored** (models garble URLs): in
  `studio/src/personalization/generate/orchestrate.ts`, after generation set `sms.link` and
  web/email `ctaUrl` to `<STOREFRONT_BASE>/offer/<slug>/<segmentKey>` (helper
  `buildOfferPath(slug, key)`). Add `slug` + storefront base to the brief/args plumbing.
- **`studio/src/personalization/generate/promptAssembly.ts`:** instruct SMS to be concise,
  end with the "View offer" link, and **not** inline full terms (link leads to terms).
- **SMS 160→250 (two places + docs):** `studio/src/schemaTypes/objects/smsContent.ts`
  `.max(160)`→`.max(250)` (+ error text); patch the **live `channel-sms` doc** (`maxLength`
  160→250 and its `constraints` string) via Studio or MCP `patch_documents`; update
  `docs/SEED.md`. Update affected studio tests (`promptAssembly.test.ts`, `orchestrate.test.ts`).

## Critical files
- New: everything under `apps/storefront/` + root `package.json` scripts.
- Reused: `studio/src/personalization/generate/tokens.ts`,
  `studio/src/ui/campaign/previews/HeroChannelPreview.tsx` (pattern),
  `apps/campaign-studio/tsconfig.json` (alias convention).
- Edited (deep-link/SMS): `studio/src/personalization/generate/orchestrate.ts`,
  `.../promptAssembly.ts`, `studio/src/schemaTypes/objects/smsContent.ts`, `docs/SEED.md`,
  live `channel-sms` document.

## Verification (end-to-end)
1. **Confirm published data** (top risk): GROQ against `production` published perspective —
   `*[_type=="contentVariation" && channel=="web" && status=="generated" && brief->slug.current==$slug]{segment, "h": web.headline}`.
   If only release-staged, **publish the release first** (else every page 404s).
2. `npm run storefront:dev`; open `/offer/<brief>/loyal` — verify headline/body/CTA = the
   `loyal` web variation, tokens resolved (e.g. `{{product.name}}`, `{{offer.amount}}`).
3. Switch persona (`new`/`business`/`value`) — content + brand color/logo change to the
   matching variation (business→FirstNet, value→Cricket); unavailable personas not offered.
4. "See full terms" → `/offer/<brief>/<persona>/terms` renders disclaimers.
5. `/` gallery lists each brief × available personas; all links resolve.
6. Regenerate an SMS — `sms.message` ≤250, contains `View offer: <STOREFRONT_BASE>/offer/<slug>/<segment>`,
   no inline terms; link lands on the correct personalized page. Schema accepts 161–250.
7. `npm --workspace storefront run build` + `typecheck` pass (proves the `@studio` token
   import transpiles in a production build).

## Out of scope (future)
Release-attach in the App SDK (§5.1) and porting real FE styling into the in-App previews
(§5.2) — deferred per the chosen scope.
