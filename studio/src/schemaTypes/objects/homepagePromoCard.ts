import {defineField, defineType} from 'sanity'

export const homepagePromoCard = defineType({
  name: 'homepagePromoCard',
  title: 'Promo card',
  type: 'object',
  fields: [
    defineField({name: 'badge', title: 'Badge', type: 'string'}),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
    defineField({name: 'ctaUrl', title: 'CTA URL', type: 'url'}),
    defineField({
      name: 'theme',
      type: 'string',
      options: {
        list: [
          {title: 'Default (AT&T blue)', value: 'att'},
          {title: 'Fiber (navy)', value: 'fiber'},
          {title: 'Wireless (charcoal)', value: 'wireless'},
        ],
      },
      initialValue: 'att',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
  ],
  preview: {
    select: {title: 'title', badge: 'badge'},
    prepare({title, badge}) {
      return {title: title || 'Promo card', subtitle: badge}
    },
  },
})
