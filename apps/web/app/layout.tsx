import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TopNav } from '@/components/layout/TopNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Origin Market — Authentic Products from the Source',
  description: 'Shop verified products made by artisans in their home country.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <SupabaseProvider>
            <TopNav />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}