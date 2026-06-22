import {defineField, defineType} from 'sanity'

export const siteHeader = defineType({
  name: 'siteHeader',
  title: 'Site header',
  type: 'object',
  fields: [
    defineField({
      name: 'utilityLinks',
      title: 'Utility bar links',
      type: 'array',
      of: [{type: 'navLink'}],
    }),
    defineField({
      name: 'logoImage',
      title: 'Logo image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'logoImageUrl',
      title: 'Logo image URL',
      type: 'url',
      description: 'Media Library or external CDN URL when not using a project asset.',
    }),
    defineField({
      name: 'logoText',
      title: 'Logo text fallback',
      type: 'string',
      description: 'Shown when no logo image is set.',
      initialValue: 'AT&T',
    }),
    defineField({
      name: 'primaryNav',
      title: 'Primary navigation',
      type: 'array',
      of: [{type: 'navLink'}],
    }),
    defineField({
      name: 'actionLink',
      title: 'Header action link',
      type: 'navLink',
      description: 'Right-side link (e.g. demo “Personalized offers”).',
    }),
  ],
})
