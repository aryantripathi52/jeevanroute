import React from 'react'

export default function GlassNav({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={`navbar ${className}`}>
      {children}
    </nav>
  )
}
