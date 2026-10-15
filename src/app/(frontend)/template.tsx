'use client'
import { useEffect, useState } from 'react'

// Client-side navigations fade the new page in. Opacity only: a full-screen backdrop blur was
// costly on low-end phones, and a lingering `filter` breaks position:fixed children. The first
// page load shows the server HTML as is, and visitors who prefer reduced motion get no
// animation (see .page-enter in globals.scss).
let hasHydrated = false

export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hasHydrated)

  useEffect(() => {
    hasHydrated = true
  }, [])

  return <div className={animate ? 'page-enter relative' : 'relative'}>{children}</div>
}
