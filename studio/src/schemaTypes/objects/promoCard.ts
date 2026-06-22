import {defineField, defineType} from 'sanity'

export const promoCard = defineType({
  name: 'promoCard',
  title: 'Promo card',
  type: 'object',
  fields: [
    defineField({name: 'badge', title: 'Badge', type: 'string'}),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'url',
      description: 'Supports https://, tel: and mailto: links.',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'tel', 'mailto']}),
    }),
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
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Flex card (att.com horizontal)', value: 'flex'},
          {title: 'Stacked (image on top)', value: 'stack'},
        ],
      },
      initialValue: 'flex',
    }),
    defineField({
      name: 'legalNote',
      title: 'Legal fine print',
      type: 'text',
      rows: 2,
    }),
    defineField({name: 'legalLinkLabel', title: 'Legal link label', type: 'string'}),
    defineField({
      name: 'legalLinkUrl',
      title: 'Legal link URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'tel', 'mailto']}),
    }),
    defineField({name: 'secondaryCtaLabel', title: 'Secondary CTA label', type: 'string'}),
    defineField({
      name: 'secondaryCtaUrl',
      title: 'Secondary CTA URL',
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
      description: 'Media Library or external CDN URL when not using a project asset.',
    }),
  ],
  preview: {
    select: {title: 'title', badge: 'badge'},
    prepare({title, badge}) {
      return {title: title || 'Promo card', subtitle: badge}
    },
  },
})
