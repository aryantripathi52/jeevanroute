import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JeevanRoute — Smart Algorithm-Driven Ambulance Routing',
  description: 'Get to the right hospital. Not just the nearest one. smart algorithm-driven ambulance routing for India.',
  keywords: 'ambulance routing, emergency medical, hospital finder, smart algorithm triage, India',
  openGraph: {
    title: 'JeevanRoute',
    description: 'smart algorithm-driven ambulance routing — saving lives by finding the right hospital fast.',
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
