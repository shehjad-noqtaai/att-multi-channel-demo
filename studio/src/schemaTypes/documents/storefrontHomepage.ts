import {defineField, defineType} from 'sanity'
import {PAGE_SECTIONS} from '../blocks/pageSections'

export const storefrontHomepage = defineType({
  name: 'storefrontHomepage',
  title: 'Storefront homepage',
  type: 'document',
  groups: [
    {name: 'page', title: 'Page', default: true},
    {name: 'shell', title: 'Site shell'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'AT&T Homepage',
      validation: (r) => r.required(),
      group: 'page',
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      of: PAGE_SECTIONS,
      description:
        'Drag to reorder. Each block is a reusable section type (hero, feature split, FAQ, etc.).',
      group: 'page',
    }),
    defineField({
      name: 'header',
      title: 'Site header',
      type: 'siteHeader',
      group: 'shell',
    }),
    defineField({
      name: 'promoBar',
      title: 'Top promo bar',
      type: 'promoBar',
      group: 'shell',
    }),
    defineField({
      name: 'promoLegalNote',
      title: 'Promo legal fine print',
      type: 'legalNote',
      description: 'Small disclaimer shown under the promo bar (att.com-style).',
      group: 'shell',
    }),
    defineField({
      name: 'orderCta',
      title: 'Order CTA strip',
      type: 'orderCta',
      description: 'Phone / order strip below the promo area.',
      group: 'shell',
    }),
    defineField({
      name: 'footer',
      title: 'Site footer',
      type: 'siteFooter',
      group: 'shell',
    }),
  ],
  preview: {
    select: {title: 'title', count: 'sections.length'},
    prepare({title, count}) {
      return {
        title: title || 'Storefront homepage',
        subtitle: count ? `${count} section(s)` : 'No sections',
      }
    },
  },
})
