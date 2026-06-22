'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {PERSONA_KEYS, PERSONAS} from '@/lib/personas'
import {CAMPAIGN_PREVIEW_KEYS, CAMPAIGN_PREVIEWS, type CampaignPreviewKey} from '@/lib/campaignPreview'
import {PUBLISHED_PERSPECTIVE, SIM_PARAM_PREFIX, simParamName, type SimMergeField} from '@/lib/simulator'
import type {PersonaKey} from '@/types'

interface ReleaseOption {
  id: string
  title: string
  type?: string
}

interface Props {
  activeCampaign: CampaignPreviewKey
  activePersona: PersonaKey
  activePerspective: string
  mergeFields: SimMergeField[]
  releases: ReleaseOption[]
  previewEnabled: boolean
  /**
   * 'home' (default) drives persona/campaign via query params on the current
   * path. 'offer' is used on /offer/[brief]/[persona]: persona switching
   * navigates by path, and the campaign selector is hidden (the brief is fixed).
   */
  mode?: 'home' | 'offer'
  /** Required in 'offer' mode — the brief slug that owns the offer route. */
  briefSlug?: string
}

interface Position {
  left: number
  top: number
}

const POS_KEY = 'att-simulator:pos'
const COLLAPSED_KEY = 'att-simulator:collapsed'

export function AudienceSimulator({
  activeCampaign,
  activePersona,
  activePerspective,
  mergeFields,
  releases,
  previewEnabled,
  mode = 'home',
  briefSlug,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOffer = mode === 'offer'

  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [dragging, setDragging] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{startX: number; startY: number; originLeft: number; originTop: number} | null>(null)
  const posRef = useRef<Position | null>(null)

  // Restore saved position + collapsed state on mount (survives full reloads).
  useEffect(() => {
    try {
      const savedPos = window.localStorage.getItem(POS_KEY)
      if (savedPos) {
        const p = JSON.parse(savedPos) as Position
        if (typeof p?.left === 'number' && typeof p?.top === 'number') {
          setPosition(p)
          posRef.current = p
        }
      }
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === '1')
    } catch {
      /* ignore unavailable storage */
    }
  }, [])

  // ---- Dragging ----------------------------------------------------------
  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore drags that start on the minimize button.
    if ((e.target as HTMLElement).closest('button')) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = {startX: e.clientX, startY: e.clientY, originLeft: rect.left, originTop: rect.top}
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }, [])

  const onHandlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current
      const el = containerRef.current
      if (!d || !el) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      let left = d.originLeft + (e.clientX - d.startX)
      let top = d.originTop + (e.clientY - d.startY)
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8))
      top = Math.max(8, Math.min(top, window.innerHeight - h - 8))
      const next = {left, top}
      posRef.current = next
      setPosition(next)
    },
    [],
  )

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    dragRef.current = null
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer may already be released */
    }
    if (posRef.current) {
      try {
        window.localStorage.setItem(POS_KEY, JSON.stringify(posRef.current))
      } catch {
        /* ignore */
      }
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  // ---- URL state ---------------------------------------------------------
  const initialValues = useMemo(() => {
    const out: Record<string, string> = {}
    for (const mf of mergeFields) {
      const fromUrl = searchParams.get(simParamName(mf.key))
      if (fromUrl != null) out[mf.key] = fromUrl
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [values, setValues] = useState<Record<string, string>>(initialValues)

  const pushUrl = useCallback(
    (next: {
      campaign?: CampaignPreviewKey
      persona?: PersonaKey
      perspective?: string
      overrides?: Record<string, string>
    }) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const key of Array.from(params.keys())) {
        if (key.startsWith(SIM_PARAM_PREFIX)) params.delete(key)
      }

      const perspective = next.perspective ?? activePerspective
      if (perspective && perspective !== PUBLISHED_PERSPECTIVE) {
        params.set('perspective', perspective)
      } else {
        params.delete('perspective')
      }

      const overrides = next.overrides ?? values
      for (const mf of mergeFields) {
        const v = overrides[mf.key]
        if (v != null && v !== '' && v !== (mf.sampleValue ?? '')) {
          params.set(simParamName(mf.key), v)
        }
      }

      const persona = next.persona ?? activePersona
      const qs = params.toString()
      if (isOffer && briefSlug) {
        // Persona is a route segment on the offer page; campaign is fixed.
        const base = `/offer/${briefSlug}/${persona}`
        router.replace(qs ? `${base}?${qs}` : base, {scroll: false})
      } else {
        params.set('campaign', next.campaign ?? activeCampaign)
        params.set('persona', persona)
        router.replace(`${pathname}?${params.toString()}`, {scroll: false})
      }
    },
    [router, pathname, searchParams, activeCampaign, activePersona, activePerspective, values, mergeFields, isOffer, briefSlug],
  )

  const onFieldChange = useCallback(
    (key: string, value: string) => {
      const nextValues = {...values, [key]: value}
      setValues(nextValues)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => pushUrl({overrides: nextValues}), 350)
    },
    [values, pushUrl],
  )

  const resetSamples = useCallback(() => {
    setValues({})
    pushUrl({overrides: {}})
  }, [pushUrl])

  const hasOverrides = useMemo(
    () =>
      mergeFields.some(
        (mf) => values[mf.key] != null && values[mf.key] !== '' && values[mf.key] !== (mf.sampleValue ?? ''),
      ),
    [values, mergeFields],
  )

  // Default (pre-drag) placement comes from CSS (top-right). Once dragged or
  // restored, position is pinned via inline left/top.
  const style: React.CSSProperties | undefined = position
    ? {left: position.left, top: position.top, right: 'auto'}
    : undefined

  return (
    <div
      ref={containerRef}
      className={`att-simulator${dragging ? ' att-simulator--dragging' : ''}${collapsed ? ' att-simulator--collapsed' : ''}`}
      style={style}
      role="region"
      aria-label="Audience simulator"
    >
      <div
        className="att-simulator__handle"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="att-simulator__title">
          <span className="att-simulator__grip" aria-hidden="true">
            ⠿
          </span>
          Audience Simulator
        </span>
        <button
          type="button"
          className="att-simulator__min"
          aria-label={collapsed ? 'Expand simulator' : 'Collapse simulator'}
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
        >
          {collapsed ? '▢' : '—'}
        </button>
      </div>

      {!collapsed ? (
        <div className="att-simulator__body">
          {!isOffer ? (
            <div className="att-simulator__row">
              <span className="att-simulator__label">Campaign:</span>
              <div className="att-simulator__pills" role="group" aria-label="Campaign">
                {CAMPAIGN_PREVIEW_KEYS.map((key) => {
                  const meta = CAMPAIGN_PREVIEWS[key]
                  const isActive = key === activeCampaign
                  return (
                    <button
                      key={key}
                      type="button"
                      title={meta.description}
                      className={`att-simulator__pill${isActive ? ' att-simulator__pill--active' : ''}`}
                      aria-pressed={isActive}
                      onClick={() => pushUrl({campaign: key})}
                    >
                      {meta.title}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="att-simulator__row">
            <span className="att-simulator__label">Segment:</span>
            <div className="att-simulator__pills" role="group" aria-label="Audience segment">
              {PERSONA_KEYS.map((key) => {
                const meta = PERSONAS[key]
                const isActive = key === activePersona
                return (
                  <button
                    key={key}
                    type="button"
                    className={`att-simulator__pill${isActive ? ' att-simulator__pill--active' : ''}`}
                    aria-pressed={isActive}
                    style={
                      isActive
                        ? {backgroundColor: meta.brandColor, borderColor: meta.brandColor, color: '#fff'}
                        : {borderColor: meta.brandColor, color: meta.brandColor}
                    }
                    onClick={() => pushUrl({persona: key})}
                  >
                    {meta.title}
                  </button>
                )
              })}
            </div>
          </div>

          {previewEnabled ? (
            <div className="att-simulator__row">
              <span className="att-simulator__label">Source:</span>
              <select
                className="att-simulator__select"
                value={activePerspective}
                onChange={(e) => pushUrl({perspective: e.currentTarget.value})}
                aria-label="Content source perspective"
              >
                <option value={PUBLISHED_PERSPECTIVE}>Published (live)</option>
                {releases.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                    {r.type ? ` (${r.type})` : ''}
                  </option>
                ))}
              </select>
              {activePerspective !== PUBLISHED_PERSPECTIVE ? (
                <span className="att-simulator__badge">Previewing release</span>
              ) : null}
            </div>
          ) : null}

          <div className="att-simulator__details">
            <button
              type="button"
              className="att-simulator__toggle"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? '▾' : '▸'} Simulate user details
              {hasOverrides ? <span className="att-simulator__badge">customized</span> : null}
            </button>

            {open ? (
              <div className="att-simulator__fields">
                <p className="att-simulator__hint">
                  Segment selects <em>which</em> variation is shown. These values fill the dynamic{' '}
                  <code>{'{{tokens}}'}</code> inside it — they don’t change which variation is selected.
                </p>
                <div className="att-simulator__grid">
                  {mergeFields.map((mf) => {
                    const id = `sim-${mf.key}`
                    const value = values[mf.key] ?? ''
                    return (
                      <label key={mf.key} className="att-simulator__field" htmlFor={id}>
                        <span className="att-simulator__field-label">{mf.label || mf.key}</span>
                        <input
                          id={id}
                          type="text"
                          className="att-simulator__input"
                          value={value}
                          placeholder={mf.sampleValue || mf.key}
                          onChange={(e) => onFieldChange(mf.key, e.currentTarget.value)}
                        />
                        {mf.description ? (
                          <span className="att-simulator__field-hint">{mf.description}</span>
                        ) : null}
                      </label>
                    )
                  })}
                </div>
                <button
                  type="button"
                  className="att-simulator__reset"
                  onClick={resetSamples}
                  disabled={!hasOverrides}
                >
                  Reset to samples
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
