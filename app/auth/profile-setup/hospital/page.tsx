'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassInput from '@/components/GlassInput'
import GlassButton from '@/components/GlassButton'

export default function HospitalProfileSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hospitals, setHospitals] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    role: 'Doctor',
    phone: '',
    hospital_id: ''
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    // Get current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      router.push('/auth/login')
      return
    }

    // Check if profile already exists
    const { data: profile } = await supabase
      .from('hospital_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile) {
      // Profile already exists, skip setup
      router.push('/hospital')
      return
    }

    // Load hospitals list
    const { data: hospitalsData } = await supabase.from('hospitals').select('*')
    if (hospitalsData) setHospitals(hospitalsData)
    
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate fields
    if (!form.name || !form.role || !form.phone || !form.hospital_id) {
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
      .from('hospital_profiles')
      .insert({
        user_id: user.id,
        name: form.name,
        role: form.role,
        phone: form.phone,
        hospital_id: form.hospital_id,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(`Failed to save profile: ${insertError.message}`)
      setLoading(false)
      return
    }

    // Success — go to hospital dashboard
    router.push('/hospital')
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
          <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏥</span>
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
            <label className="text-secondary text-sm block mb-1">Full Name *</label>
            <GlassInput
              type="text"
              placeholder="Dr. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-secondary text-sm block mb-1">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input"
            >
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
            </select>
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
            <label className="text-secondary text-sm block mb-1">Select Hospital *</label>
            <select
              value={form.hospital_id}
              onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
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
