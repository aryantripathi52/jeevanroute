import { InputHTMLAttributes } from 'react'

export default function GlassInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-8 py-5 bg-white/15 border-3 border-white/25 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-2xl ${className}`}
    />
  )
}
