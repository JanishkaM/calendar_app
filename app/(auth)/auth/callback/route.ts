import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.headers.get('host')
  const origin = host
    ? `${forwardedProto ?? requestUrl.protocol.replace(':', '')}://${host}`
    : requestUrl.origin

  // Create the redirect response up-front so we can attach Set-Cookie headers to it.
  const response = NextResponse.redirect(new URL(next, origin))

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options?: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options?: CookieOptions) {
            response.cookies.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  return response
}
