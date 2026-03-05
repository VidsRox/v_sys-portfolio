import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'My portfolio and blog',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
