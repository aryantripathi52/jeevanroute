import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data, error } = await supabaseServer
      .from('cases')
      .select('*, hospitals(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json({ case: data })
  } catch (error) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }
}
