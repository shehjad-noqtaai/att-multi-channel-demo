import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Storefront homepage')
        .id('storefrontHomepage')
        .child(
          S.document().schemaType('storefrontHomepage').documentId('storefront-homepage'),
        ),
      S.divider(),
      S.documentTypeListItem('campaignBrief').title('Campaign briefs'),
      S.documentTypeListItem('contentVariation').title('Variations'),
      S.divider(),
      S.listItem()
        .title('Media library')
        .child(S.documentTypeList('mediaAsset').title('Media assets')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          !['campaignBrief', 'contentVariation', 'mediaAsset', 'storefrontHomepage'].includes(
            item.getId() ?? '',
          ),
      ),
    ])
