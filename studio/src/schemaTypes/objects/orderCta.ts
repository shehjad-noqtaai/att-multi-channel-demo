import {defineField, defineType} from 'sanity'

export const orderCta = defineType({
  name: 'orderCta',
  title: 'Order CTA strip',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'phoneLabel',
      title: 'Phone label',
      type: 'string',
      initialValue: 'ORDER NOW',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone number',
      type: 'string',
      description: 'Display format, e.g. 844-249-5043',
    }),
    defineField({
      name: 'phoneHref',
      title: 'Phone link',
      type: 'string',
      description: 'tel: URI, e.g. tel:+18442495043',
    }),
  ],
})
