// Clerk middleware — will protect dashboard routes once API keys are added
// For now, allows all traffic through since no CLERK keys are set
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// When Clerk keys are added, replace this with:
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// const isProtected = createRouteMatcher(["/dashboard(.*)"]);
// export default clerkMiddleware((auth, req) => {
//   if (isProtected(req)) auth().protect();
// });

export function middleware(request: NextRequest) {
  // Public routes — always accessible
  const publicPaths = ["/", "/sign-in", "/sign-up", "/api/webhooks"];
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes — will enforce auth once Clerk is configured
  // For now, allow all access for development
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
