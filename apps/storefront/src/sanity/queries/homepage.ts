import {defineQuery} from 'next-sanity'

export const HOMEPAGE_QUERY = defineQuery(`*[_type == "storefrontHomepage" && _id == "storefront-homepage"][0]{
  _id,
  title,
  promoBar,
  primaryHero{
    enabled, slotStyle, label, defaultPersona, staticFallback,
    "campaignBrief": campaignBrief->{
      _id, title, "slug": slug.current
    }
  },
  personalizedBanners[]{
    enabled, slotStyle, label, defaultPersona, staticFallback,
    "campaignBrief": campaignBrief->{
      _id, title, "slug": slug.current
    }
  },
  promoGridTitle,
  promoCards[]{
    _key, badge, title, description, ctaLabel, ctaUrl, theme,
    image{alt, url, asset}
  },
  personalizedPromoSlots[]{
    enabled, slotStyle, label, defaultPersona, staticFallback,
    "campaignBrief": campaignBrief->{
      _id, title, "slug": slug.current
    }
  }
}`)
