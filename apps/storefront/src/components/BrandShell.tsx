import type {ReactNode} from 'react'
import {themeForSegment} from '../lib/theme'

interface BrandShellProps {
  brandColor?: string | null
  children: ReactNode
}

/**
 * BrandShell — sets --brand-primary on its root so descendant chrome can
 * `color: var(--brand-primary)` / `background: var(--brand-primary)` without
 * knowing which persona is active.
 */
export function BrandShell({brandColor, children}: BrandShellProps) {
  return (
    <div className="brand-shell" style={themeForSegment(brandColor)}>
      {children}
    </div>
  )
}
