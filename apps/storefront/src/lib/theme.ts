// Theming swap layer. The whole storefront chrome reads
// `var(--brand-primary)`; we set it on a wrapper element per page based on
// the matched segment's brandColor. When the FE reference repo arrives we
// port its design tokens into globals.css and components/ — the theming
// contract here doesn't change.

import type {CSSProperties} from 'react'

const DEFAULT_BRAND = '#00A8E0' // AT&T blue

export function themeForSegment(brandColor?: string | null): CSSProperties {
  const color = brandColor && brandColor.trim().length > 0 ? brandColor : DEFAULT_BRAND
  return {
    // CSS custom prop — chrome reads this through `var(--brand-primary)`.
    ['--brand-primary' as string]: color,
  }
}
