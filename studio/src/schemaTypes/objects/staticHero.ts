import {defineField, defineType} from 'sanity'

/** CMS fallback when no published web variation resolves for the slot. */
export const staticHero = defineType({
  name: 'staticHero',
  title: 'Static fallback',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'headline', type: 'string'}),
    defineField({name: 'subheadline', type: 'string'}),
    defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
    defineField({name: 'ctaUrl', title: 'CTA URL', type: 'url'}),
    defineField({
      name: 'backgroundImage',
      title: 'Background image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alt text'})],
    }),
    defineField({
      name: 'backgroundImageUrl',
      title: 'Background image URL',
      type: 'url',
      description: 'Media Library or external CDN URL when not using a project asset.',
    }),
  ],
})
