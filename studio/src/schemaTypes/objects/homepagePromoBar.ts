import {defineField, defineType} from 'sanity'

export const homepagePromoBar = defineType({
  name: 'homepagePromoBar',
  title: 'Promo bar',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 2,
    }),
    defineField({name: 'linkLabel', title: 'Link label', type: 'string'}),
    defineField({name: 'linkUrl', title: 'Link URL', type: 'url'}),
  ],
})
