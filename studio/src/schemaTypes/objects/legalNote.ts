import {defineField, defineType} from 'sanity'

export const legalNote = defineType({
  name: 'legalNote',
  title: 'Legal fine print',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
    }),
    defineField({name: 'linkLabel', title: 'Details link label', type: 'string'}),
    defineField({name: 'linkUrl', title: 'Details link URL', type: 'url'}),
  ],
})
