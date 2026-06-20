import { InputHTMLAttributes } from 'react'

export default function GlassInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`input ${className}`}
    />
  )
}
