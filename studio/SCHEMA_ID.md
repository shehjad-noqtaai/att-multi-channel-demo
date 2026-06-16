# Schema deployment record

**Status:** ⏸ **Deploy pending — `SANITY_AUTH_TOKEN` not yet available in the build environment.**

## Expected schemaId

Single workspace (`name: 'default'`) → `_.schemas.default`

This is the value that `personalization/generate/agentGenerate.ts` will reference via the
`AGENT_SCHEMA_ID` constant (see PRD §AI generation pipeline).

## How to deploy when the token is set

```bash
# from repo root
export SANITY_AUTH_TOKEN=<editor-or-deploy-token>
cd studio
npx sanity schema deploy
```

After deploy, capture the full CLI output below and replace this stub.

## Deploy output

_Pending. Will be filled in when `npx sanity schema deploy` runs successfully._
