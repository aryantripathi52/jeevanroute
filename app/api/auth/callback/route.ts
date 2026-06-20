import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
    }

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
    }

    let redirectUrl: URL
    const role = user.user_metadata?.role

    if (role === 'hospital') {
      // Check hospital profile
      const { data: profile } = await supabase
        .from('hospital_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      redirectUrl = profile
        ? new URL('/hospital', requestUrl.origin)
        : new URL('/auth/profile-setup/hospital', requestUrl.origin)
    } else {
      // Ambulance operator
      const { data: profile } = await supabase
        .from('operator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      redirectUrl = profile
        ? new URL('/ambulance', requestUrl.origin)
        : new URL('/auth/profile-setup/ambulance', requestUrl.origin)
    }

    // Create redirect response and copy cookies
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie)
    })

    return redirectResponse
  }

  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
