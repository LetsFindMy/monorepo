// import { auth } from '@/src/auth';

import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server"
import { parse } from "#/lib/utils"

// Environment variables
const NODE_ENV = process.env.NODE_ENV!
const NEXT_PUBLIC_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN!
const NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX

const isProduction = NODE_ENV === "production"
const authPages = ["login", "logout", "signup", "forgot-password", "reset-password"]

// Utility functions
const serveFourOhFour = (req: NextRequest) => {
  return NextResponse.rewrite(new URL("/404", req.url), { status: 404 })
}

// Matcher configuration
export const config = {
  matcher: ["/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
}

// Main middleware function
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  try {
    const url = req.nextUrl
    const { domain, path, key } = parse(req)
    const { pathname } = url
    const searchParams = url.searchParams.toString()
    const isAuthPage = authPages.some((page) => pathname === `/${page}`)

    // Get hostname
    let hostname = req.headers.get("host")!

    // Handle Vercel preview deployment URLs
    if (hostname.includes("---") && hostname.endsWith(`.${NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)) {
      hostname = NEXT_PUBLIC_ROOT_DOMAIN
    }

    // Debug logging
    console.log("middleware", {
      hostname,
      pathname,
      searchParams,
      domain,
      key,
      isProduction,
      isAuthPage,
      fullUrl: req.url,
      host: req.headers.get("host"),
    })

    // Root domain handling
    if (hostname === NEXT_PUBLIC_ROOT_DOMAIN) {
      if (isAuthPage) {
        return NextResponse.next()
      }
      if (pathname === "/") {
        return NextResponse.rewrite(new URL("/home", req.url))
      }
      return NextResponse.next()
    }

    // Special domain mappings
    const hostMappings = {
      [`api.${NEXT_PUBLIC_ROOT_DOMAIN}`]: "/api",
      [`auth.${NEXT_PUBLIC_ROOT_DOMAIN}`]: "/auth",
      [`events.${NEXT_PUBLIC_ROOT_DOMAIN}`]: "/events",
      [`my.${NEXT_PUBLIC_ROOT_DOMAIN}`]: "/my",
    }

    if (hostMappings[hostname]) {
      if (hostname === `my.${NEXT_PUBLIC_ROOT_DOMAIN}` && (pathname === "/" || pathname === "")) {
        return NextResponse.redirect(new URL("/profile", req.url))
      }
      return NextResponse.rewrite(new URL(`${hostMappings[hostname]}${pathname}`, req.url))
    }

    // ETL Better With domain handling
    if (hostname === `etl-better-with.${NEXT_PUBLIC_ROOT_DOMAIN}`) {
      if (isAuthPage) {
        return serveFourOhFour(req)
      }
      return NextResponse.rewrite(new URL(`/etl-better-with${pathname === "/" ? "" : pathname}`, req.url))
    }

    // About page redirect
    if (hostname === `about.${NEXT_PUBLIC_ROOT_DOMAIN}`) {
      return NextResponse.redirect("https://vercel.com/blog/platforms-starter-kit")
    }

    // Handle auth pages
    if (isAuthPage) {
      return NextResponse.next()
    }

    // Handle main application routes
    if (pathname.startsWith("/app")) {
      // You can add any necessary auth checks here
      return NextResponse.next()
    }

    // Fallback for unknown routes
    return serveFourOhFour(req)
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}



// Export with auth wrapper
// export default auth((req) => {
//   return middleware(req, {} as NextFetchEvent);
// }) as any;
