import {defineField, defineType} from 'sanity'

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answer',
      type: 'text',
      rows: 6,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bullets',
      title: 'Bullet points',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Optional list shown below the answer paragraph(s).',
    }),
  ],
  preview: {
    select: {title: 'question'},
    prepare({title}) {
      return {title: title || 'FAQ item'}
    },
  },
})
