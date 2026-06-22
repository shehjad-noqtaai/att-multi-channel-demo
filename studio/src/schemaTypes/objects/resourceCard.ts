import {defineField, defineType} from 'sanity'

export const resourceCard = defineType({
  name: 'resourceCard',
  title: 'Resource card',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Body copy for standard cards. Omit when using link list only.',
    }),
    defineField({
      name: 'links',
      title: 'Link list',
      type: 'array',
      of: [{type: 'navLink'}],
      description: 'Optional list of links instead of description + CTA (e.g. “Helpful resources”).',
    }),
    defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'url',
      description: 'Supports https://, tel: and mailto: links.',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'tel', 'mailto']}),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'imageUrl',
      title: 'Image URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
    prepare({title, media}) {
      return {title: title || 'Resource card', media}
    },
  },
})
