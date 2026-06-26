import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'NagarAI - Smart Civic Reporting',
  description: 'Report and track civic issues with AI-powered analysis and predictive insights',
  generator: 'v0.app',
  icons: {
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased relative min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Animated Background Blobs for Glassmorphism */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-0">
            {children}
          </div>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
