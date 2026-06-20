import {defineField, defineType} from 'sanity'

export const storefrontHomepage = defineType({
  name: 'storefrontHomepage',
  title: 'Storefront homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'AT&T Homepage',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'promoBar',
      title: 'Top promo bar',
      type: 'homepagePromoBar',
    }),
    defineField({
      name: 'primaryHero',
      title: 'Primary hero',
      type: 'homepagePersonalizedSlot',
      description:
        'Main homepage hero. Copy and imagery resolve from the linked brief’s published web variation.',
    }),
    defineField({
      name: 'personalizedBanners',
      title: 'Personalized banners',
      type: 'array',
      of: [{type: 'homepagePersonalizedSlot'}],
      description: 'Optional compact banners (e.g. switch-and-save strip) fed by campaign briefs.',
    }),
    defineField({
      name: 'promoGridTitle',
      title: 'Promo grid heading',
      type: 'string',
      initialValue: 'Great connections start here',
    }),
    defineField({
      name: 'promoCards',
      title: 'Promo cards',
      type: 'array',
      of: [{type: 'homepagePromoCard'}],
    }),
    defineField({
      name: 'personalizedPromoSlots',
      title: 'Personalized promo cards',
      type: 'array',
      of: [{type: 'homepagePersonalizedSlot'}],
      description:
        'Grid tiles whose content comes from campaign brief web variations (slot style: promo).',
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'Storefront homepage'}
    },
  },
})
