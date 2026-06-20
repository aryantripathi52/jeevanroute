'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassInput from '@/components/GlassInput'
import GlassButton from '@/components/GlassButton'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState<'ambulance' | 'hospital' | null>(null)
  const [role, setRole] = useState<'ambulance' | 'hospital' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/auth/role-check')
      }
    }
    checkSession()
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return alert('Please select a role first')
    setLoading(true)
    setError(null)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const user = data.user
    const userRole = user?.user_metadata?.role

    if (userRole && userRole !== role) {
      alert(`This account is registered as ${userRole === 'ambulance' ? 'Ambulance Operator' : 'Hospital Staff'}`)
      setLoading(false)
      return
    }

    if (!userRole) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role }
      })
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    }

    router.push('/auth/role-check')
  }

  const handleGoogleLogin = async (selectedRole: 'ambulance' | 'hospital') => {
    setGoogleLoading(selectedRole)
    localStorage.setItem('pending_role', selectedRole)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        console.error(error)
        alert('Google login failed: ' + error.message)
        localStorage.removeItem('pending_role')
      }
    } catch (error) {
      console.error(error)
      alert('Google login failed')
      localStorage.removeItem('pending_role')
    } finally {
      setGoogleLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">JR</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">JeevanRoute</h1>
          <p className="text-secondary text-sm mt-1">Every second counts</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <p className="text-secondary text-sm text-center">Sign in as:</p>
          
          <button
            onClick={() => handleGoogleLogin('ambulance')}
            disabled={googleLoading === 'ambulance'}
            className="w-full btn btn-secondary py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{googleLoading === 'ambulance' ? 'Signing in...' : '🚑 Continue as Ambulance Operator'}</span>
          </button>

          <button
            onClick={() => handleGoogleLogin('hospital')}
            disabled={googleLoading === 'hospital'}
            className="w-full btn btn-secondary py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{googleLoading === 'hospital' ? 'Signing in...' : '🏥 Continue as Hospital Staff'}</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-secondary">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-secondary text-sm block mb-1 font-medium">Email</label>
            <GlassInput
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-secondary text-sm block mb-1 font-medium">Password</label>
            <GlassInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-secondary text-sm block mb-3 font-medium">Sign in as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('ambulance')}
                className={`p-4 rounded-lg border transition-all ${
                  role === 'ambulance'
                    ? 'border-red-500 bg-red-50 text-primary'
                    : 'border-gray-200 bg-white text-secondary hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🚑</div>
                <div className="font-medium">Ambulance</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('hospital')}
                className={`p-4 rounded-lg border transition-all ${
                  role === 'hospital'
                    ? 'border-blue-500 bg-blue-50 text-primary'
                    : 'border-gray-200 bg-white text-secondary hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🏥</div>
                <div className="font-medium">Hospital</div>
              </button>
            </div>
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            disabled={loading || !role}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </GlassButton>
        </form>

        <p className="text-center text-secondary text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-accent hover:text-accent-hover font-medium">
            Sign Up
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}