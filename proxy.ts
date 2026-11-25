import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const rateLimitMap = new Map();

export async function proxy(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  if (ip !== 'unknown') {
    const limit = 50; // Requests per window
    const windowMs = 60 * 1000; // 1 minute

    const currentRate = rateLimitMap.get(ip) || { count: 0, startTime: Date.now() };

    if (Date.now() - currentRate.startTime > windowMs) {
      currentRate.count = 1;
      currentRate.startTime = Date.now();
    } else {
      currentRate.count++;
    }

    rateLimitMap.set(ip, currentRate);

    if (currentRate.count > limit) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session — this is critical
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = request.nextUrl.pathname === '/'
  const isProtected =
    request.nextUrl.pathname.startsWith('/ambulance') ||
    request.nextUrl.pathname.startsWith('/hospital')

  // Not logged in trying to access protected page
  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Logged in trying to access login page
  if (session && request.nextUrl.pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/auth/role-check', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
