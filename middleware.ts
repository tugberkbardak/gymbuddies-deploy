// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
// };


import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook/clerk",
  "/profile/username/(.*)", // Allow public access to profile pages
])

export default clerkMiddleware({
  publicRoutes: (req) => isPublicRoute(req),
})

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
}

