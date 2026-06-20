import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JeevanRoute — AI-Powered Ambulance Routing',
  description: 'Get to the right hospital. Not just the nearest one. AI-powered ambulance routing for India.',
  keywords: 'ambulance routing, emergency medical, hospital finder, AI triage, India',
  openGraph: {
    title: 'JeevanRoute',
    description: 'AI-powered ambulance routing — saving lives by finding the right hospital fast.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
