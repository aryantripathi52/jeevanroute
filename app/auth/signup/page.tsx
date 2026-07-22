'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Navigation, Activity, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return alert('Please select a role')
    if (password !== confirmPassword) return alert('Passwords do not match')
    
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      })
      if (error) throw error
      
      router.push('/auth/role-check')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async (selectedRole: 'ambulance' | 'hospital') => {
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
        alert('Google signup failed: ' + error.message)
        localStorage.removeItem('pending_role')
      }
    } catch (error) {
      console.error(error)
      alert('Google signup failed')
      localStorage.removeItem('pending_role')
    } finally {
      setGoogleLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col lg:flex-row relative overflow-hidden font-sans text-gray-100">
      
      {/* 1. Left Column (The Brand/Context) - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#020617] relative flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        
        {/* Animated SVG Map Mesh Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="rgba(225, 29, 72, 0.15)" strokeWidth="1">
              {[...Array(15)].map((_, i) => (
                <line key={`lh-${i}`} x1="0" y1={i * 40} x2="500" y2={i * 40} />
              ))}
              {[...Array(15)].map((_, i) => (
                <line key={`lv-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" />
              ))}
            </g>
            <circle cx="160" cy="200" r="40" fill="rgba(99, 102, 241, 0.1)" className="animate-pulse" />
            <circle cx="360" cy="320" r="60" fill="rgba(225, 29, 72, 0.08)" className="animate-pulse-soft" />
            
            <path d="M40,240 Q160,160 280,240 T440,240" stroke="#E11D48" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="5 5" />
            <path d="M120,400 Q240,280 360,400" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="5 5" />
          </svg>
        </div>

        {/* Brand Header */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/30 group-hover:bg-brand-red/20 transition-colors">
            <Activity className="h-5 w-5 text-brand-red" />
          </div>
          <span className="font-bold text-lg text-white">
            JR <span className="text-gray-300 font-light">JeevanRoute</span>
          </span>
        </Link>

        {/* Central Core Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Every Second Counts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-red">
              Connecting Ambulances & Hospitals in Real-Time.
            </span>
          </h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            JeevanRoute streamlines critical medical dispatches, enabling instant routing, telemetry broadcasts, and zero-delay hospital slots.
          </p>

          {/* feature callouts */}
          <div className="space-y-4 pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red mt-0.5 animate-pulse">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Smart Algorithm-Driven Triage</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">Vitals analyzed en-route to match specialized medical staff.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 mt-0.5">
                <Navigation className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Dynamic Navigation</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">Real-time green-corridor prompts bypass signal delays.</p>
              </div>
            </div>
          </div>
        </div>

        {/* footer back */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to landing page
          </Link>
        </div>
      </div>

      {/* 2. Right Column (The Auth Cards) */}
      <div className="flex-1 min-h-screen flex items-center justify-center p-6 md:p-12 relative z-10">
        
        {/* Glow point behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[440px] space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-gray-400 font-light">
              Register credentials to join JeevanRoute command center
            </p>
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-lg p-3 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Card Container */}
          <div className="rounded-xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-md space-y-6">
            
            {/* OAuth buttons section */}
            <div className="space-y-3">
              <p className="text-gray-400 text-xs text-center font-mono">REGISTER WITH SECURED OAUTH</p>
              
              <button
                onClick={() => handleGoogleSignup('ambulance')}
                disabled={googleLoading === 'ambulance'}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.127 4.114a5.757 5.757 0 0 1-5.76-5.76 5.757 5.757 0 0 1 5.76-5.76c1.5 0 2.85.587 3.863 1.543l3.228-3.229C19.123 1.956 15.897 1 12 1 5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11c0-.772-.082-1.5-.225-2.286H12.24Z" />
                </svg>
                <span>{googleLoading === 'ambulance' ? 'Connecting...' : '🚑 Register as Ambulance Operator'}</span>
              </button>

              <button
                onClick={() => handleGoogleSignup('hospital')}
                disabled={googleLoading === 'hospital'}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.127 4.114a5.757 5.757 0 0 1-5.76-5.76 5.757 5.757 0 0 1 5.76-5.76c1.5 0 2.85.587 3.863 1.543l3.228-3.229C19.123 1.956 15.897 1 12 1 5.925 1 12 12 12 12s4.925 11 11 11 11-4.925 11-11c0-.772-.082-1.5-.225-2.286H12.24Z" />
                </svg>
                <span>{googleLoading === 'hospital' ? 'Connecting...' : '🏥 Register as Hospital Staff'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/5"></div>
              <span className="absolute bg-[#090d16] px-3 text-[10px] text-gray-500 font-mono">OR REG EMAIL</span>
            </div>

            {/* Email form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-mono">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="name@command.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-mono">PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-mono">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-mono block">SELECT OPERATIONS PORTAL</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('ambulance')}
                    className={`py-3 px-2 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      role === 'ambulance'
                        ? 'border-brand-red bg-brand-red/10 text-white'
                        : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">🚑</span>
                    <span>Ambulance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('hospital')}
                    className={`py-3 px-2 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      role === 'hospital'
                        ? 'border-brand-red bg-brand-red/10 text-white'
                        : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">🏥</span>
                    <span>Hospital Staff</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !role}
                className="w-full btn btn-primary py-3 text-xs font-mono tracking-wider cursor-pointer"
              >
                {loading ? 'CREATING IDENTIFICATION...' : 'REGISTER CREDENTIALS'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 font-light">
            Already have credentials?{' '}
            <Link href="/auth/login" className="text-brand-red hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
