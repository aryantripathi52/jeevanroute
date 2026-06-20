import { ButtonHTMLAttributes } from 'react'

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'red' | 'blue' | 'green' | 'white'
}

export default function GlassButton({
  children,
  className = '',
  variant = 'white',
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    red: 'border-red-500 bg-red-500/35 hover:bg-red-500/45 text-white shadow-xl shadow-red-500/25',
    blue: 'border-blue-500 bg-blue-500/35 hover:bg-blue-500/45 text-white shadow-xl shadow-blue-500/25',
    green: 'border-green-500 bg-green-500/35 hover:bg-green-500/45 text-white shadow-xl shadow-green-500/25',
    white: 'border-white/50 bg-white/25 hover:bg-white/35 text-white shadow-xl shadow-white/15',
  }

  return (
    <button
      {...props}
      className={`px-8 py-4 rounded-2xl border-3 font-black transition-all duration-300 hover:scale-105 active:scale-95 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
