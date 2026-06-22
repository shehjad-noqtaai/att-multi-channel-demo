import {defineField, defineType} from 'sanity'

/** Personalized hero — shown when the storefront campaign preview matches. */
export const pageSectionHero = defineType({
  name: 'pageSectionHero',
  title: 'Personalized hero',
  type: 'object',
  fields: [
    defineField({
      name: 'campaignPreview',
      title: 'Campaign preview',
      type: 'string',
      options: {
        list: [
          {title: 'Trade-in (default)', value: 'trade-in'},
          {title: 'Abandoned cart', value: 'abandoned-cart'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slot',
      type: 'personalizedSlot',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'slot.label', campaign: 'campaignPreview'},
    prepare({title, campaign}) {
      return {
        title: title || 'Personalized hero',
        subtitle: campaign ? `Campaign: ${campaign}` : undefined,
      }
    },
  },
})

/** Compact personalized banner strip(s). */
export const pageSectionBanner = defineType({
  name: 'pageSectionBanner',
  title: 'Personalized banner',
  type: 'object',
  fields: [
    defineField({
      name: 'campaignPreview',
      title: 'Show when campaign is',
      type: 'string',
      options: {
        list: [
          {title: 'Trade-in only', value: 'trade-in'},
          {title: 'Abandoned cart only', value: 'abandoned-cart'},
          {title: 'Always', value: 'always'},
        ],
      },
      initialValue: 'trade-in',
    }),
    defineField({
      name: 'slots',
      type: 'array',
      of: [{type: 'personalizedSlot'}],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: {count: 'slots.length', campaign: 'campaignPreview'},
    prepare({count, campaign}) {
      return {
        title: 'Personalized banner',
        subtitle: `${count ?? 0} slot(s) · ${campaign ?? 'always'}`,
      }
    },
  },
})

/** Section heading + split feature block (att.com/home-phone style). */
export const pageSectionFeatureGroup = defineType({
  name: 'pageSectionFeatureGroup',
  title: 'Feature group',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionTitle',
      title: 'Section heading',
      type: 'string',
      description: 'Optional heading above the feature block.',
    }),
    defineField({
      name: 'block',
      type: 'featureBlock',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'sectionTitle', feature: 'block.title'},
    prepare({title, feature}) {
      return {
        title: title || feature || 'Feature group',
        subtitle: title && feature ? feature : undefined,
      }
    },
  },
})

export const pageSectionResourceCards = defineType({
  name: 'pageSectionResourceCards',
  title: 'Resource cards',
  type: 'object',
  fields: [
    defineField({
      name: 'section',
      type: 'resourceSection',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'section.title', count: 'section.cards.length'},
    prepare({title, count}) {
      return {
        title: title || 'Resource cards',
        subtitle: count ? `${count} card(s)` : undefined,
      }
    },
  },
})

export const pageSectionFaq = defineType({
  name: 'pageSectionFaq',
  title: 'FAQ accordion',
  type: 'object',
  fields: [
    defineField({
      name: 'section',
      type: 'faqSection',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'section.title', count: 'section.items.length'},
    prepare({title, count}) {
      return {
        title: title || 'FAQ',
        subtitle: count ? `${count} question(s)` : undefined,
      }
    },
  },
})

export const pageSectionPromoBand = defineType({
  name: 'pageSectionPromoBand',
  title: 'Promo flex band',
  type: 'object',
  fields: [
    defineField({
      name: 'cards',
      title: 'Promo cards',
      type: 'array',
      of: [{type: 'promoCard'}],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: {cards: 'cards'},
    prepare({cards}) {
      const count = Array.isArray(cards) ? cards.length : 0
      const first = cards?.[0]?.title
      return {
        title: 'Promo flex band',
        subtitle: first ? `${count} card(s) · ${first}` : `${count} card(s)`,
      }
    },
  },
})

/** All blocks available in the page builder. */
export const PAGE_SECTIONS = [
  {type: 'pageSectionHero'},
  {type: 'pageSectionBanner'},
  {type: 'pageSectionFeatureGroup'},
  {type: 'pageSectionResourceCards'},
  {type: 'pageSectionFaq'},
  {type: 'pageSectionPromoBand'},
]

export const pageSectionTypes = [
  pageSectionHero,
  pageSectionBanner,
  pageSectionFeatureGroup,
  pageSectionResourceCards,
  pageSectionFaq,
  pageSectionPromoBand,
]
