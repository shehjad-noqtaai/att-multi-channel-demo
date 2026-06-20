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
import {homepagePromoBar} from './objects/homepagePromoBar'
import {homepageStaticHero} from './objects/homepageStaticHero'
import {homepagePersonalizedSlot} from './objects/homepagePersonalizedSlot'
import {homepagePromoCard} from './objects/homepagePromoCard'

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
  homepagePromoBar,
  homepageStaticHero,
  homepagePersonalizedSlot,
  homepagePromoCard,
]
