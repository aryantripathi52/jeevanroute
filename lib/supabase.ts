import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Hospital = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  specialties: string[]
  icu_available: boolean
  available_beds: number
  blood_types_available: string[]
}

export type Case = {
  id: string
  created_at: string
  patient_condition: string
  severity: number
  age: number
  blood_group: string
  allergies: string
  pickup_lat: number
  pickup_lng: number
  current_lat: number
  current_lng: number
  ai_triage_result: TriageResult | null
  status: string
  assigned_hospital_id: string | null
  declined_hospitals: string[]
}

export type Alert = {
  id: string
  case_id: string
  hospital_id: string
  status: 'pending' | 'accepted' | 'declined'
  decline_reason: string | null
  created_at: string
  responded_at: string | null
}

export type TriageResult = {
  required_specialty: string
  urgency: 'critical' | 'high' | 'moderate'
  equipment_needed: string[]
  blood_required: string
  prep_instructions: string[]
}
