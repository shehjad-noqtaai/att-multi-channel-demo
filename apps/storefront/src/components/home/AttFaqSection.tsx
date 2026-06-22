'use client'

import {useMemo, useState} from 'react'
import type {FaqSection} from '@/types/storefront'

function FaqAnswer({answer, bullets}: {answer: string; bullets?: string[]}) {
  const paragraphs = answer.split(/\n\n+/).filter(Boolean)
  const list = bullets?.filter(Boolean) ?? []

  return (
    <div className="att-faq__answer">
      {paragraphs.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {list.length > 0 ? (
        <ul>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function AttFaqSection({section}: {section: FaqSection}) {
  const items = useMemo(() => section.items?.filter((i) => i.question && i.answer) ?? [], [section.items])
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set())
  const [showAll, setShowAll] = useState(false)

  if (section.enabled === false || !section.title || !items.length) return null

  const initialCount = section.initialVisibleCount ?? items.length
  const hasHidden = items.length > initialCount
  const visibleItems = showAll || !hasHidden ? items : items.slice(0, initialCount)
  const allVisibleOpen = visibleItems.every((item, i) =>
    openKeys.has(item._key ?? `faq-${i}`),
  )

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAll = () => {
    if (allVisibleOpen) {
      setOpenKeys(new Set())
      return
    }
    setOpenKeys(new Set(visibleItems.map((item, i) => item._key ?? `faq-${i}`)))
  }

  const expandLabel = allVisibleOpen
    ? (section.collapseAllLabel ?? 'Collapse all')
    : (section.expandAllLabel ?? 'Expand all')

  return (
    <section className="att-faq">
      <div className="att-faq__inner">
        <h2 className="att-faq__title">{section.title}</h2>
        <button type="button" className="att-faq__expand-all" onClick={toggleAll}>
          {expandLabel}
        </button>

        <div className="att-faq__list">
          {visibleItems.map((item, i) => {
            const key = item._key ?? `faq-${i}`
            const isOpen = openKeys.has(key)
            const panelId = `att-faq-panel-${key}`

            return (
              <div key={key} className={`att-faq__item${isOpen ? ' att-faq__item--open' : ''}`}>
                <h3 className="att-faq__question-wrap">
                  <button
                    type="button"
                    className="att-faq__question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(key)}
                  >
                    <span>{item.question}</span>
                    <span className="att-faq__chevron" aria-hidden />
                  </button>
                </h3>
                <div id={panelId} className="att-faq__panel" hidden={!isOpen}>
                  <FaqAnswer answer={item.answer ?? ''} bullets={item.bullets} />
                </div>
              </div>
            )
          })}
        </div>

        {hasHidden && !showAll ? (
          <button type="button" className="att-faq__view-more" onClick={() => setShowAll(true)}>
            {section.viewMoreLabel ?? 'View more'}
          </button>
        ) : section.viewMoreUrl && section.viewMoreLabel ? (
          <a href={section.viewMoreUrl} className="att-faq__view-more att-faq__view-more--link">
            {section.viewMoreLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
