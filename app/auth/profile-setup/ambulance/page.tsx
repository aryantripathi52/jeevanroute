'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassInput from '@/components/GlassInput'
import GlassButton from '@/components/GlassButton'

export default function AmbulanceProfileSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    operator_name: '',
    vehicle_number: '',
    phone: '',
    license_number: ''
  })

  useEffect(() => {
    checkProfileExists()
  }, [])

  async function checkProfileExists() {
    // Get current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      router.push('/auth/login')
      return
    }

    // Check if profile already exists
    const { data: profile } = await supabase
      .from('operator_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile) {
      // Profile already exists, skip setup
      router.push('/ambulance')
      return
    }

    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate fields
    if (!form.operator_name || !form.vehicle_number || !form.phone || !form.license_number) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Session expired. Please login again.')
      setLoading(false)
      router.push('/auth/login')
      return
    }

    // Insert profile
    const { error: insertError } = await supabase
      .from('operator_profiles')
      .insert({
        user_id: user.id,
        operator_name: form.operator_name,
        vehicle_number: form.vehicle_number,
        phone: form.phone,
        license_number: form.license_number
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(`Failed to save profile: ${insertError.message}`)
      setLoading(false)
      return
    }

    // Success — go to ambulance dashboard
    router.push('/ambulance')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="text-center">
          <p>Checking profile...</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚑</span>
          </div>
          <h1 className="text-2xl font-bold">Setup Your Profile</h1>
          <p className="text-secondary text-sm mt-1">This is a one-time setup. You won't need to fill this again.</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-secondary text-sm block mb-1">Operator Name *</label>
            <GlassInput
              type="text"
              placeholder="Your full name"
              value={form.operator_name}
              onChange={(e) => setForm({ ...form, operator_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-secondary text-sm block mb-1">Vehicle Number *</label>
            <GlassInput
              type="text"
              placeholder="e.g. HR-26-AB-1234"
              value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-secondary text-sm block mb-1">Phone Number *</label>
            <GlassInput
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-secondary text-sm block mb-1">License Number *</label>
            <GlassInput
              type="text"
              placeholder="Driving license number"
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              required
            />
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Save Profile & Continue →'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  )
}
