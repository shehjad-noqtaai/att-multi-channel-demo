import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="notfound">
      <h1>Offer not available</h1>
      <p>This offer hasn't been published, or has expired.</p>
      <Link href="/">Browse current offers</Link>
    </div>
  )
}
