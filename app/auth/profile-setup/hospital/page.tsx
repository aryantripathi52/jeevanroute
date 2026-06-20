'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
        <div className="glass-card p-8 text-white text-center">
          <p>Checking profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Setup Your Profile</h1>
          <p className="text-white/70 text-sm mt-1">This is a one-time setup. You won't need to fill this again.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm block mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="Dr. John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-1">Role *</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/40 outline-none"
            >
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-1">Phone Number *</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/40 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-1">Select Hospital *</label>
            <select
              value={form.hospital_id}
              onChange={e => setForm({ ...form, hospital_id: e.target.value })}
              className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/40 outline-none"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all mt-6"
          >
            {loading ? 'Saving Profile...' : 'Save Profile & Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
