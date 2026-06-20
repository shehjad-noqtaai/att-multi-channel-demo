interface CtaProps {
  label: string
  href?: string
}

export function Cta({label, href}: CtaProps) {
  if (!label) return null
  const target = href && href.trim().length > 0 ? href : '#'
  const isExternal = /^https?:\/\//.test(target)
  return (
    <a
      className="cta"
      href={target}
      {...(isExternal ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
    >
      {label}
    </a>
  )
}
