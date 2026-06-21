/** Homepage campaign preview modes (distinct from audience persona/segment). */
export type CampaignPreviewKey = 'trade-in' | 'abandoned-cart'

export interface CampaignPreview {
  key: CampaignPreviewKey
  title: string
  description: string
}

export const CAMPAIGN_PREVIEWS: Record<CampaignPreviewKey, CampaignPreview> = {
  'trade-in': {
    key: 'trade-in',
    title: 'Trade-in event',
    description: 'Promotional iPhone 17 Pro campaign',
  },
  'abandoned-cart': {
    key: 'abandoned-cart',
    title: 'Abandoned cart',
    description: 'AT&T Fiber order recovery flow',
  },
}

export const CAMPAIGN_PREVIEW_KEYS: CampaignPreviewKey[] = ['trade-in', 'abandoned-cart']

export function parseCampaignPreview(value: string | undefined): CampaignPreviewKey {
  if (value && value in CAMPAIGN_PREVIEWS) return value as CampaignPreviewKey
  return 'trade-in'
}
