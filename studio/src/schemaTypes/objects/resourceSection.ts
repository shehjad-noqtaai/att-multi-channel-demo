import {defineField, defineType} from 'sanity'

export const resourceSection = defineType({
  name: 'resourceSection',
  title: 'Resource cards section',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'AT&T Home Phone: More resources',
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [{type: 'resourceCard'}],
      validation: (r) => r.max(4),
    }),
  ],
  preview: {
    select: {title: 'title', count: 'cards.length'},
    prepare({title, count}) {
      return {
        title: title || 'Resource cards',
        subtitle: count ? `${count} card(s)` : 'No cards',
      }
    },
  },
})
