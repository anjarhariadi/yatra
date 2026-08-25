import { NextResponse, type NextRequest } from 'next/server'

// ponytail: cookie-presence check only (UX redirect); real session verification
// lives in dashboard layout + tRPC context
const SESSION_COOKIE = 'better-auth.session_token'

export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE)
  const { pathname } = request.nextUrl

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/new-password')

  if (!hasSessionCookie && !isAuthPage && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSessionCookie && (isAuthPage || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
