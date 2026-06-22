import {defineField, defineType} from 'sanity'

export const featureBlock = defineType({
  name: 'featureBlock',
  title: 'Feature block',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 2}),
    defineField({
      name: 'bullets',
      title: 'Bullet points',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'legalNote',
      title: 'Disclaimer',
      type: 'text',
      rows: 2,
    }),
    defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'string',
      description: 'Use tel:+1… for phone CTAs.',
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
    select: {title: 'title', eyebrow: 'eyebrow'},
    prepare({title, eyebrow}) {
      return {title: title || 'Feature block', subtitle: eyebrow}
    },
  },
})
