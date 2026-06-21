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
      title: 'Primary hero (promotional)',
      type: 'homepagePersonalizedSlot',
      description:
        'Default homepage hero — typically the promotional / trade-in brief.',
    }),
    defineField({
      name: 'abandonedCartHero',
      title: 'Abandoned cart hero',
      type: 'homepagePersonalizedSlot',
      description:
        'Hero shown when the storefront preview is switched to the abandoned-cart campaign.',
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
