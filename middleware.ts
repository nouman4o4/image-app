import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const token = (req as any).nextauth?.token
    const { pathname, search } = req.nextUrl

    // 🔐 If NOT authenticated and route is protected → redirect
    if (!token && isProtectedRoute(pathname)) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("redirect", pathname + search)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true
      },
    },
  },
)
function isProtectedRoute(pathname: string) {
  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/pin") ||
    pathname.startsWith("/api/pin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/media")
  ) {
    return false
  }

  return true
}
