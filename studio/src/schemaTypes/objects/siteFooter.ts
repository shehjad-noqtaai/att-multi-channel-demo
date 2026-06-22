import {defineField, defineType} from 'sanity'

export const footerLinkGroup = defineType({
  name: 'footerLinkGroup',
  title: 'Footer link group',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'links',
      type: 'array',
      of: [{type: 'navLink'}],
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})

export const siteFooter = defineType({
  name: 'siteFooter',
  title: 'Site footer',
  type: 'object',
  fields: [
    defineField({
      name: 'linkGroups',
      title: 'Link columns',
      type: 'array',
      of: [{type: 'footerLinkGroup'}],
    }),
    defineField({
      name: 'legalText',
      title: 'Legal / disclaimer text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'copyright',
      type: 'string',
      initialValue: '© AT&T Intellectual Property. All rights reserved.',
    }),
  ],
})
