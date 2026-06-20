// Centralised offer URL builders. The storefront re-exports the *same*
// helpers that orchestrate.ts uses to write `sms.link` / `ctaUrl` so the
// model-produced link and storefront-side link can never drift.

export {buildOfferPath, buildOfferUrl} from '@studio/personalization/generate/orchestrate'
