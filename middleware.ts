import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // sessions.lgandecki.net/xyz → rewrite to /video-player/xyz
  if (host.startsWith('sessions.')) {
    // Root of sessions subdomain → redirect to a default video or show index
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/video-player', request.url))
    }
    // sessions.lgandecki.net/demo → /video-player/demo
    return NextResponse.rewrite(new URL(`/video-player${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
}
