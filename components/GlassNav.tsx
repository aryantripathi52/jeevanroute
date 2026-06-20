import React from 'react'

export default function GlassNav({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={`glass-card px-8 py-6 ${className}`}>
      {children}
    </nav>
  )
}
