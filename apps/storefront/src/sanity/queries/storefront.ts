import {defineQuery} from 'next-sanity'

const imageFields = `alt, url, asset`

const navLinkFields = `label, href, openInNewTab`

const headerFields = `{
  utilityLinks[]{${navLinkFields}},
  logoText,
  logoImage{${imageFields}},
  logoImageUrl,
  primaryNav[]{${navLinkFields}},
  actionLink{${navLinkFields}}
}`

const footerFields = `{
  linkGroups[]{
    title,
    links[]{${navLinkFields}}
  },
  legalText,
  copyright
}`

const slotFields = `{
  enabled, slotStyle, label, defaultPersona,
  staticFallback{
    eyebrow, headline, subheadline, ctaLabel, ctaUrl,
    backgroundImage{${imageFields}},
    backgroundImageUrl
  },
  "campaignBrief": campaignBrief->{
    _id, title, "slug": slug.current, multiStep
  }
}`

const featureBlockFields = `{
  enabled, eyebrow, title, description, bullets,
  legalNote, ctaLabel, ctaUrl,
  image{${imageFields}},
  imageUrl
}`

const resourceSectionFields = `{
  enabled, title,
  cards[]{
    _key, title, description,
    links[]{${navLinkFields}},
    ctaLabel, ctaUrl,
    image{${imageFields}},
    imageUrl
  }
}`

const faqSectionFields = `{
  enabled, title, expandAllLabel, collapseAllLabel,
  initialVisibleCount, viewMoreLabel, viewMoreUrl,
  items[]{
    _key, question, answer, bullets
  }
}`

const promoCardFields = `{
  _key, badge, title, description, ctaLabel, ctaUrl,
  secondaryCtaLabel, secondaryCtaUrl,
  legalNote, legalLinkLabel, legalLinkUrl,
  layout, theme,
  image{${imageFields}},
  imageUrl
}`

const sectionFields = `sections[]{
  _key, _type,
  _type == "pageSectionHero" => {
    campaignPreview,
    slot${slotFields}
  },
  _type == "pageSectionBanner" => {
    campaignPreview,
    slots[]${slotFields}
  },
  _type == "pageSectionFeatureGroup" => {
    sectionTitle,
    block${featureBlockFields}
  },
  _type == "pageSectionResourceCards" => {
    section${resourceSectionFields}
  },
  _type == "pageSectionFaq" => {
    section${faqSectionFields}
  },
  _type == "pageSectionPromoBand" => {
    cards[]${promoCardFields}
  }
}`

/** Legacy flat fields — kept for documents not yet migrated to `sections`. */
const legacyFields = `
  primaryHero${slotFields},
  abandonedCartHero${slotFields},
  personalizedBanners[]${slotFields},
  promoGridTitle,
  featureBlock${featureBlockFields},
  resourceSection${resourceSectionFields},
  faqSection${faqSectionFields},
  promoCards[]${promoCardFields},
  personalizedPromoSlots[]${slotFields}
`

export const STOREFRONT_SHELL_QUERY = defineQuery(`*[_type == "storefrontHomepage" && _id == "storefront-homepage"][0]{
  _id,
  header${headerFields},
  orderCta,
  footer${footerFields}
}`)

export const STOREFRONT_QUERY = defineQuery(`*[_type == "storefrontHomepage" && _id == "storefront-homepage"][0]{
  _id,
  title,
  header${headerFields},
  promoBar,
  promoLegalNote,
  orderCta,
  footer${footerFields},
  ${sectionFields},
  ${legacyFields}
}`)
