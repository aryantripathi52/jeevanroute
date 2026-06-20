import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const { case_id, current_lat, current_lng } = await req.json()

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

    // Get current case
    const { data: caseData } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Find the current assigned hospital and add to declined list
    const declined = caseData.declined_hospitals || []
    if (caseData.assigned_hospital_id && !declined.includes(caseData.assigned_hospital_id)) {
      declined.push(caseData.assigned_hospital_id)
    }

    // Escalate severity
    const newSeverity = Math.min(10, (caseData.severity || 5) + 1)

    // Update case
    await supabaseServer
      .from('cases')
      .update({
        declined_hospitals: declined,
        severity: newSeverity,
        current_lat,
        current_lng,
      })
      .eq('id', case_id)

    // Get new recommendations
    const recommendRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/recommend`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id, lat: current_lat, lng: current_lng }),
      }
    )
    const { hospitals } = await recommendRes.json()

    if (!hospitals || hospitals.length === 0) {
      return NextResponse.json({ error: 'No hospitals available' }, { status: 404 })
    }

    const newHospital = hospitals[0]

    // Auto-alert the new top hospital
    const alertRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/alert`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id, hospital_id: newHospital.id }),
      }
    )
    const { alert } = await alertRes.json()

    return NextResponse.json({ hospital: newHospital, alert_id: alert.id, hospitals })
  } catch (error) {
    console.error('Reroute error:', error)
    return NextResponse.json({ error: 'Reroute failed' }, { status: 500 })
  }
}
