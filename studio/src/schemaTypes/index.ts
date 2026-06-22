import {campaignBrief} from './documents/campaignBrief'
import {channel} from './documents/channel'
import {segment} from './documents/segment'
import {mergeField} from './documents/mergeField'
import {product} from './documents/product'
import {mediaAsset} from './documents/mediaAsset'
import {contentVariation} from './documents/contentVariation'
import {storefrontHomepage} from './documents/storefrontHomepage'

import {flowStep} from './objects/flowStep'
import {webContent} from './objects/webContent'
import {emailContent} from './objects/emailContent'
import {smsContent} from './objects/smsContent'
import {promoBar} from './objects/promoBar'
import {staticHero} from './objects/staticHero'
import {personalizedSlot} from './objects/personalizedSlot'
import {promoCard} from './objects/promoCard'
import {navLink} from './objects/navLink'
import {siteHeader} from './objects/siteHeader'
import {siteFooter, footerLinkGroup} from './objects/siteFooter'
import {legalNote} from './objects/legalNote'
import {featureBlock} from './objects/featureBlock'
import {resourceCard} from './objects/resourceCard'
import {resourceSection} from './objects/resourceSection'
import {faqItem} from './objects/faqItem'
import {faqSection} from './objects/faqSection'
import {orderCta} from './objects/orderCta'
import {pageSectionTypes} from './blocks/pageSections'

export const schemaTypes = [
  // Documents
  campaignBrief,
  channel,
  segment,
  mergeField,
  product,
  mediaAsset,
  contentVariation,
  storefrontHomepage,
  // Objects
  flowStep,
  webContent,
  emailContent,
  smsContent,
  promoBar,
  staticHero,
  personalizedSlot,
  promoCard,
  navLink,
  siteHeader,
  footerLinkGroup,
  siteFooter,
  legalNote,
  orderCta,
  featureBlock,
  resourceCard,
  resourceSection,
  faqItem,
  faqSection,
  ...pageSectionTypes,
]
