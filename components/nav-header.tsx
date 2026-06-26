'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useEffect } from 'react'

export function NavHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const isNavVisible = isScrolled || mobileMenuOpen || pathname !== '/'

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isNavVisible 
          ? 'border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-lg shadow-lg shadow-primary/30">
            <Image src="/logo.jpeg" alt="NagarAI Logo" width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <span className="font-bold text-xl text-foreground drop-shadow-md">
            NagarAI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {['/', '/report', '/dashboard', '/complaint-letter'].map((path) => {
            const labels: Record<string, string> = {
              '/': 'Home',
              '/report': 'Report Issue',
              '/dashboard': 'Dashboard',
              '/complaint-letter': 'Letter'
            }
            return (
              <Link
                key={path}
                href={path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {labels[path]}
              </Link>
            )
          })}
          <div className="ml-2 pl-2 border-l border-border/40">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button 
            className="ml-2 p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/40 p-4 flex flex-col gap-2 shadow-xl animate-in slide-in-from-top-2">
          {['/', '/report', '/dashboard', '/complaint-letter'].map((path) => {
            const labels: Record<string, string> = {
              '/': 'Home',
              '/report': 'Report Issue',
              '/dashboard': 'Dashboard',
              '/complaint-letter': 'Letter'
            }
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {labels[path]}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
