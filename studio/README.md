# Sanity Studio — Owner: @schema-lead → @studio-ui-lead

Sanity Studio for the AT&T Multi-channel Personalization POC.

This package is currently a placeholder. **@schema-lead** scaffolds it (pass 1) by mirroring the BMW reference at `out/dpl_4dfJtvSpNwGwKzPitJF1Nc9QMbgA/source/studio/` — same stack versions (`sanity ^5.30`, React 19, `@sanity/assist ^6`), same schema conventions (`defineType`/`defineField`, `validation.warning()/.error()`, image `aiAssist`).

## Owns
- All schema types in `src/schemaTypes/` (see PRD §Content model)
- AI generation core in `src/plugins/personalization/generate/` (handed off to @ai-core-lead in pass 3)
- Studio document action + Variations doc view + per-channel preview components (handed off to @studio-ui-lead in pass 4–5)

## Stack (lock to reference versions)
- `sanity ^5.30`
- `react ^19`
- `@sanity/client ^7.20`
- `@sanity/assist ^6`
- `@sanity/ui ^3`

## Sanity project
- projectId: `z6s0fz61`
- dataset: `production` (single workspace → `schemaId = '_.schemas.default'`)

## After any schema change
```
npx sanity schema deploy
```
…and re-capture `schemaId`. Generate validates against the deployed schema.
