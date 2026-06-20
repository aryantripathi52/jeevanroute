import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const { case_id, hospital_id } = await req.json()

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

    // Insert alert
    const { data: alert, error } = await supabaseServer
      .from('alerts')
      .insert({ case_id, hospital_id, status: 'pending' })
      .select()
      .single()

    if (error) throw error

    // Update case assigned hospital
    await supabaseServer
      .from('cases')
      .update({ assigned_hospital_id: hospital_id })
      .eq('id', case_id)

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Alert error:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
