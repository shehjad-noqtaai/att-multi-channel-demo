import {defineField, defineType} from 'sanity'

/**
 * A homepage region (hero, top banner, or inline promo) whose copy and imagery
 * come from the published web `contentVariation` for a linked campaign brief.
 */
export const homepagePersonalizedSlot = defineType({
  name: 'homepagePersonalizedSlot',
  title: 'Personalized slot',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'slotStyle',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Hero — full bleed', value: 'hero'},
          {title: 'Banner — compact strip', value: 'banner'},
          {title: 'Promo card — grid tile', value: 'promo'},
        ],
        layout: 'radio',
      },
      initialValue: 'hero',
    }),
    defineField({
      name: 'label',
      title: 'Editor label',
      type: 'string',
      description: 'Internal name shown in the page builder (e.g. "Primary hero").',
    }),
    defineField({
      name: 'campaignBrief',
      title: 'Campaign brief',
      type: 'reference',
      to: [{type: 'campaignBrief'}],
      description:
        'Published web variations for this brief supply headline, subheadline, CTA, and hero image.',
    }),
    defineField({
      name: 'defaultPersona',
      title: 'Default persona',
      type: 'string',
      description: 'Segment key used when the storefront has no ?persona= query param.',
      options: {
        list: [
          {title: 'New / Prospective', value: 'new'},
          {title: 'Existing / Loyal', value: 'loyal'},
          {title: 'Business / FirstNet', value: 'business'},
          {title: 'Value / Cricket', value: 'value'},
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'staticFallback',
      title: 'Static fallback',
      type: 'homepageStaticHero',
      description: 'Shown when no published web variation exists for the selected persona.',
    }),
  ],
  preview: {
    select: {
      label: 'label',
      style: 'slotStyle',
      briefTitle: 'campaignBrief.title',
    },
    prepare({label, style, briefTitle}) {
      return {
        title: label || briefTitle || 'Personalized slot',
        subtitle: style ? `${style} · ${briefTitle ?? 'no brief'}` : undefined,
      }
    },
  },
})
