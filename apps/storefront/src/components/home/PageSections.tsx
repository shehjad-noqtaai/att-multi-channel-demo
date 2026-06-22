import {AttHomeHero} from '@/components/home/AttHomeHero'
import {AttHomeBanner} from '@/components/home/AttHomeBanner'
import {AttFeatureSplit} from '@/components/home/AttFeatureSplit'
import {AttResourceCards} from '@/components/home/AttResourceCards'
import {AttFaqSection} from '@/components/home/AttFaqSection'
import {AttPromoCardStatic, isFlexPromoCard} from '@/components/home/AttPromoCard'
import {resolvePersonalizedSlot} from '@/lib/resolvePersonalizedSlot'
import {sectionMatchesCampaign} from '@/lib/pageSections'
import type {CampaignPreviewKey} from '@/lib/campaignPreview'
import type {PageSection} from '@/lib/pageSections'
import type {PersonaKey} from '@/types'

interface Props {
  sections: PageSection[]
  persona: PersonaKey
  campaign: CampaignPreviewKey
}

export async function PageSections({sections, persona, campaign}: Props) {
  const nodes = await Promise.all(
    sections.map(async (section, i) => {
      const key = section._key ?? `${section._type}-${i}`

      switch (section._type) {
        case 'pageSectionHero': {
          if (!sectionMatchesCampaign(section.campaignPreview, campaign)) return null
          const slot = await resolvePersonalizedSlot(section.slot, persona)
          return slot ? <AttHomeHero key={key} slot={slot} /> : null
        }
        case 'pageSectionBanner': {
          if (!sectionMatchesCampaign(section.campaignPreview, campaign)) return null
          const resolved = (
            await Promise.all((section.slots ?? []).map((s) => resolvePersonalizedSlot(s, persona)))
          ).filter(Boolean)
          return resolved.map((slot, j) =>
            slot ? <AttHomeBanner key={`${key}-${j}`} slot={slot} /> : null,
          )
        }
        case 'pageSectionFeatureGroup': {
          const block = section.block
          if (!block?.title) return null
          return (
            <section key={key} className="att-home__grid-section">
              <div className="att-home__grid-inner">
                {section.sectionTitle ? (
                  <h2 className="att-home__grid-title">{section.sectionTitle}</h2>
                ) : null}
                <AttFeatureSplit block={block} />
              </div>
            </section>
          )
        }
        case 'pageSectionResourceCards': {
          const resource = section.section
          return resource?.title ? <AttResourceCards key={key} section={resource} /> : null
        }
        case 'pageSectionFaq': {
          const faq = section.section
          return faq?.title ? <AttFaqSection key={key} section={faq} /> : null
        }
        case 'pageSectionPromoBand': {
          const flexCards = (section.cards ?? []).filter((c) => isFlexPromoCard(c))
          if (!flexCards.length) return null
          return (
            <section key={key} className="att-promo-flex-band">
              <div className="att-promo-flex-band__inner">
                <div className="att-promo-flex-band__grid">
                  {flexCards.map((card) => (
                    <AttPromoCardStatic key={card._key ?? card.title} card={card} />
                  ))}
                </div>
              </div>
            </section>
          )
        }
        default:
          return null
      }
    }),
  )

  return <>{nodes.flat()}</>
}
