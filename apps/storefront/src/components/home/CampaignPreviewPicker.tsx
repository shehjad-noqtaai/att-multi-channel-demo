'use client'

import Link from 'next/link'
import {usePathname, useSearchParams} from 'next/navigation'
import {CAMPAIGN_PREVIEW_KEYS, CAMPAIGN_PREVIEWS, type CampaignPreviewKey} from '@/lib/campaignPreview'

export function CampaignPreviewPicker({active}: {active: CampaignPreviewKey}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="att-campaign-picker" role="group" aria-label="Preview campaign">
      <span className="att-campaign-picker__label">Campaign:</span>
      <ul className="att-campaign-picker__list">
        {CAMPAIGN_PREVIEW_KEYS.map((key) => {
          const meta = CAMPAIGN_PREVIEWS[key]
          const params = new URLSearchParams(searchParams.toString())
          params.set('campaign', key)
          const href = `${pathname}?${params.toString()}`
          const isActive = key === active
          return (
            <li key={key}>
              <Link
                href={href}
                className={`att-campaign-picker__pill${isActive ? ' att-campaign-picker__pill--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                title={meta.description}
              >
                {meta.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
