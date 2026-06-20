import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Hospital, ScoredHospital } from '@/lib/supabase'
import { haversineDistance, calculateETA } from '@/lib/maps'

function scoreHospital(
  hospital: Hospital,
  requiredSpecialty: string,
  lat: number,
  lng: number,
  maxDistance: number
): number {
  let score = 0

  // Specialty match (40 pts)
  const specialtyMatch = hospital.specialties?.some(
    (s) => s.toLowerCase().includes(requiredSpecialty.toLowerCase()) ||
            requiredSpecialty.toLowerCase().includes(s.toLowerCase())
  )
  if (specialtyMatch) score += 40

  // Bed availability (30 pts)
  const bedScore = Math.min(30, (hospital.available_beds / 20) * 30)
  score += bedScore

  // Proximity (30 pts)
  const dist = haversineDistance(lat, lng, hospital.lat, hospital.lng)
  const proximityScore = Math.max(0, 30 - (dist / maxDistance) * 30)
  score += proximityScore

  // ICU bonus
  if (hospital.icu_available) score += 5

  return Math.min(100, Math.round(score))
}

export async function POST(req: NextRequest) {
  try {
    const { case_id, lat, lng } = await req.json()

    const res = NextResponse.next()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            res.cookies.delete({ name, ...options })
          },
        },
      }
    )

    // Fetch the case for triage info + declined hospitals
    const { data: caseData } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Fetch all hospitals
    const { data: hospitals } = await supabaseServer.from('hospitals').select('*')
    if (!hospitals) return NextResponse.json({ error: 'No hospitals found' }, { status: 404 })

    // Exclude declined hospitals
    const declined: string[] = caseData.declined_hospitals || []
    const eligible = hospitals.filter((h) => !declined.includes(h.id))

    const requiredSpecialty = caseData.ai_triage_result?.required_specialty || ''

    // Calculate distances
    const distances = eligible.map((h) =>
      haversineDistance(lat, lng, h.lat, h.lng)
    )
    const maxDistance = Math.max(...distances, 1)

    // Score hospitals
    const scored: ScoredHospital[] = eligible.map((h) => {
      const dist = haversineDistance(lat, lng, h.lat, h.lng)
      return {
        ...h,
        score: scoreHospital(h, requiredSpecialty, lat, lng, maxDistance),
        distance_km: Math.round(dist * 10) / 10,
        eta_minutes: calculateETA(dist),
      }
    })

    // Sort by score descending, return top 3
    const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3)

    return NextResponse.json({ hospitals: top3 })
  } catch (error) {
    console.error('Recommend error:', error)
    return NextResponse.json({ error: 'Recommendation failed' }, { status: 500 })
  }
}
