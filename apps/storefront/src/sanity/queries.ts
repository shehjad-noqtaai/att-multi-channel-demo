import {defineQuery} from 'next-sanity'

/**
 * WEB_VARIATION_QUERY — fetch the single `web`-channel contentVariation
 * matching ($brief, $persona). `flowStep == "default"` is preferred so the
 * non-flowstep (single-step) variation wins over abandoned-cart steps when
 * both exist; ties are broken by most recently generated.
 */
export const WEB_VARIATION_QUERY = defineQuery(`*[_type == "contentVariation"
  && channel == "web"
  && segment == $persona
  && status == "generated"
  && brief->slug.current == $brief
] | order(
  select(flowStep == "default" => 0, flowStep == $preferredFlowStep => 1, 2) asc,
  coalesce(generatedAt, _updatedAt) desc
)[0]{
  _id,
  segment,
  flowStep,
  generatedAt,
  "brief": brief->{
    _id, _rev, title, "slug": slug.current,
    offer, mandatoryDisclaimers, featuredProduct
  },
  "config": *[_type == "segment" && key == ^.segment][0]{
    key, title, brand, brandColor,
    "logoUrl": logo.asset->url,
    brandDisclaimers
  },
  "mergeFields": *[_type == "mergeField"]{
    key, source, sampleValue, sanityResolver, description, label
  },
  web{
    headline, subheadline,
    body,
    ctaLabel, ctaUrl,
    heroImage{alt, url, asset}
  }
}`)

/**
 * OFFER_INDEX_QUERY — gallery: every brief that has at least one published
 * `web` contentVariation, with the set of personas that have one.
 */
export const OFFER_INDEX_QUERY = defineQuery(`*[_type == "campaignBrief" && defined(slug.current)
  && count(*[_type=="contentVariation" && channel=="web" && status=="generated" && brief._ref == ^._id]) > 0
]{
  _id,
  title,
  "slug": slug.current,
  offer,
  "personas": array::unique(
    *[_type=="contentVariation" && channel=="web" && status=="generated" && brief._ref == ^._id].segment
  )
}`)

/**
 * TERMS_QUERY — brief mandatoryDisclaimers + persona brandDisclaimers for the
 * dedicated `/offer/[brief]/[persona]/terms` route.
 */
export const TERMS_QUERY = defineQuery(`*[_type=="campaignBrief" && slug.current == $brief][0]{
  title, offer, mandatoryDisclaimers,
  "persona": *[_type=="segment" && key == $persona][0]{
    title, brand, brandColor, brandDisclaimers
  }
}`)
