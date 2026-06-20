import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { triagePatient } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { condition, severity, age, blood_group, allergies, case_id } = await req.json()

    if (!condition || !severity || !age || !blood_group) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const triageResult = await triagePatient({ condition, severity, age, blood_group, allergies })

    // Update case with triage result if case_id provided
    if (case_id) {
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
      await supabaseServer
        .from('cases')
        .update({ ai_triage_result: triageResult })
        .eq('id', case_id)
    }

    return NextResponse.json({ triage: triageResult })
  } catch (error) {
    console.error('Triage error:', JSON.stringify(error, null, 2))
    console.error('Error message:', (error as Error).message)
    console.error('Error stack:', (error as Error).stack)
    return NextResponse.json({ error: 'Triage failed', details: (error as Error).message }, { status: 500 })
  }
}
