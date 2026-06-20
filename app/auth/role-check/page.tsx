'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RoleCheck() {
  const router = useRouter()
  const [status, setStatus] = useState('Setting up your session...')

  useEffect(() => {
    // Small delay to ensure cookies are set
    const timer = setTimeout(() => {
      checkAndRedirect()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  async function checkAndRedirect() {
    setStatus('Checking your account...')

    // Use getSession not getUser — works better right after OAuth
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      console.error('No session found:', error)
      setStatus('Session not found, redirecting to login...')
      setTimeout(() => router.push('/auth/login'), 1000)
      return
    }

    const user = session.user
    let role = user.user_metadata?.role

    // Check for pending role in localStorage if none in metadata
    if (!role) {
      const pendingRole = localStorage.getItem('pending_role')
      if (pendingRole) {
        console.log('Found pending role in localStorage:', pendingRole)
        // Save pending role to metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: pendingRole }
        })
        if (!updateError) {
          role = pendingRole
          localStorage.removeItem('pending_role')
        }
      }
    }

    setStatus(`Welcome! Setting up ${role === 'hospital' ? 'Hospital' : 'Ambulance'} portal...`)

    console.log('User ID:', user.id)
    console.log('Role:', role)
    console.log('Metadata:', user.user_metadata)

    if (!role) {
      console.log('No role found, redirecting to signup...')
      setTimeout(() => router.push('/auth/signup'), 1000)
      return
    }

    if (role === 'hospital') {
      const { data: profile, error: profileError } = await supabase
        .from('hospital_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('Hospital profile:', profile, profileError)

      if (!profile) {
        router.push('/auth/profile-setup/hospital')
      } else {
        router.push('/hospital')
      }
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('operator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('Operator profile:', profile, profileError)

      if (!profile) {
        router.push('/auth/profile-setup/ambulance')
      } else {
        router.push('/ambulance')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-white text-center max-w-sm w-full">
        <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/80">{status}</p>
      </div>
    </div>
  )
}
