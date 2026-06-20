import { ButtonHTMLAttributes } from 'react'

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'danger'
}

export default function GlassButton({
  children,
  className = '',
  variant = 'secondary',
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    success: 'btn btn-success',
    info: 'btn btn-info',
    danger: 'btn btn-primary', // Alias for red/danger
    red: 'btn btn-primary',
    black: 'btn btn-secondary',
    white: 'btn btn-secondary',
    green: 'btn btn-success',
    blue: 'btn btn-info',
  }

  return (
    <button
      {...props}
      className={`${variantClasses[variant as keyof typeof variantClasses]} ${className}`}
    >
      {children}
    </button>
  )
}
