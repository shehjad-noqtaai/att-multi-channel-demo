import {defineField, defineType} from 'sanity'

export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ section',
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
      initialValue: 'Frequently asked questions',
    }),
    defineField({
      name: 'expandAllLabel',
      title: 'Expand all label',
      type: 'string',
      initialValue: 'Expand all',
    }),
    defineField({
      name: 'collapseAllLabel',
      title: 'Collapse all label',
      type: 'string',
      initialValue: 'Collapse all',
    }),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [{type: 'faqItem'}],
    }),
    defineField({
      name: 'initialVisibleCount',
      title: 'Initially visible count',
      type: 'number',
      description: 'How many questions show before “View more”. Leave empty to show all.',
      initialValue: 7,
    }),
    defineField({
      name: 'viewMoreLabel',
      title: 'View more label',
      type: 'string',
      initialValue: 'View more',
    }),
    defineField({
      name: 'viewMoreUrl',
      title: 'View more URL',
      type: 'url',
      description: 'Optional link when “View more” is a button (not expand).',
    }),
  ],
  preview: {
    select: {title: 'title', count: 'items.length'},
    prepare({title, count}) {
      return {
        title: title || 'FAQ section',
        subtitle: count ? `${count} question(s)` : 'No questions',
      }
    },
  },
})
