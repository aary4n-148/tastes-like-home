import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Only apply middleware to admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return response
  }

  // Allow access to the login page without authentication
  if (request.nextUrl.pathname === '/admin/login') {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If no user or error getting user, redirect to login
    if (error || !user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      // User is authenticated but not an admin - redirect to login with error
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // User is authenticated and has admin role - allow access
    return response

  } catch (error) {
    console.error('Middleware error:', error)
    // On any error, redirect to login for security
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
}
