# AT&T Multi-channel Personalization POC

A Sanity-powered demo showing how **Sanity AI (Agent Actions)** turns a single campaign brief into a full matrix of channel- and segment-specific content variations — generated, previewable, and editable inside Sanity.

> Build-ready PRD: see [`docs/PRD.md`](./docs/PRD.md)

## The "wow" moment

A marketer writes one brief in an **App SDK app**, clicks _Generate variations_, and Sanity AI produces **12 personalized variations** (3 channels × 4 segments) — each shaped to the channel's format and the segment's brand voice. All 12 are previewable as a live channel × segment matrix inside Sanity Studio with channel-accurate mockups.

## Stack

Mirrors the proven BMW multi-market reference demo:

- **Studio** — `sanity ^5.30`, React 19, Portable Text, `@sanity/assist ^6`
- **App SDK** — `@sanity/sdk` + `@sanity/sdk-react` ^2.12, `@sanity/ui` ^3
- **Client** — `@sanity/client ^7.20` (`apiVersion: 'vX'` only inside `agentGenerate.ts`)
- **Optional** — `@sanity/blueprints` / `@sanity/functions` (auto-trigger; deferred)

## Repo layout

```
att-personalization/
├── docs/
│   └── PRD.md                          # The authoritative spec
├── studio/                             # Sanity Studio
│   └── src/
│       ├── schemaTypes/                # campaignBrief, channel, segment, mergeField, product, contentVariation
│       ├── plugins/personalization/
│       │   └── generate/               # The AI core (shared by Studio action + App SDK app)
│       │       ├── agentGenerate.ts    # ONLY file touching client.agent.action.generate (vX)
│       │       ├── orchestrate.ts      # generateMatrix(client, {...}) — pure logic
│       │       ├── promptAssembly.ts   # pure
│       │       ├── tokens.ts           # resolveTokens + chip metadata
│       │       └── ids.ts              # deterministic variation ids
│       └── tools/campaignStudio/       # Shared UI (preview components, doc view)
│           └── components/previews/    # WebHeroCard, EmailClientMock, PhoneSmsBubble
└── apps/
    └── campaign-studio/                # App SDK app — brief list, editor, Generate dialog, matrix preview
```

## Project

- **Sanity project:** `z6s0fz61` (org `oab7ManMj`)
- **GitHub:** [`shehjad-noqtaai/att-personalization`](https://github.com/shehjad-noqtaai/att-personalization)

## Build plan

| # | Owner          | Deliverable                                                                                  |
|---|----------------|----------------------------------------------------------------------------------------------|
| 1 | schema-lead    | Studio scaffold + all schemas, deploy, capture `schemaId`                                    |
| 2 | seed-lead      | Seed channels, segments, mergeField registry, sample product, 2 briefs via MCP               |
| 3 | ai-core-lead   | `generate/` module: ids, tokens, promptAssembly, agentGenerate (vX), orchestrate + tests     |
| 4 | studio-ui-lead | Studio document action + Variations doc view + per-channel preview components + token toggle |
| 5 | app-lead       | App SDK app: shell, brief list/editor, Generate dialog w/ progress, matrix preview           |
| 6 | PM             | Fallback seed (`status:'generated'`), branding polish, demo runbook                          |

## Workflow

- Feature branch per task → PR to `main` → PM reviews (build/typecheck/test locally) → merge.
- Every scope decision is recorded in the spec body, not just chat.

## Reference

A high-quality BMW multi-market demo (proven architecture for nearly every problem here) lives in the build channel filesystem at `out/dpl_4dfJtvSpNwGwKzPitJF1Nc9QMbgA/source/`. Specialists: read it first.
