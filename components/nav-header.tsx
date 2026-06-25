'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2 } from 'lucide-react'

export function NavHeader() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">NagarAI</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/report"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/report')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Report Issue
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/complaint-letter"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/complaint-letter')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Letter
          </Link>
        </div>
      </nav>
    </header>
  )
}
