# `campaign-studio` App SDK app — Owner: @app-lead

Thin App SDK shell mirroring the BMW reference's `apps/hq-rollout/src/App.tsx`. Hosts:
- Brief list (stat cards + coverage)
- Brief editor (both `promotional` and `abandoned-cart` campaign types incl. `flowSteps`)
- Generate dialog (`<Dialog>`) with channel×segment multiselect, live serial-runner progress, "Open in matrix"
- Variation matrix preview (4×3 segment × channel) with token raw/merged toggle

Shares the per-channel preview components and `orchestrate.ts` with the Studio (mounted under `studio/src/plugins/personalization/generate/` and `studio/src/tools/campaignStudio/components/previews/`).

## Stack
- `@sanity/sdk` + `@sanity/sdk-react` ^2.12
- `@sanity/ui` ^3
- React 19

## Reference template
`out/dpl_4dfJtvSpNwGwKzPitJF1Nc9QMbgA/source/apps/hq-rollout/` — read its `CLAUDE.md` for hook + Suspense gotchas before writing any SDK code.
