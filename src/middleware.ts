import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/auth(.*)', '/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  // This code executes in sub-10 milliseconds at the physical CDN Edge Node 
  // (e.g., inside the Vercel / Cloudflare edge server) before hitting the React container.
  
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-erp-path', req.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Extract Anycast Geolocation headers injected by the Edge router
  const country = req.headers.get('x-vercel-ip-country') || 'IN';
  const timezone = req.headers.get('x-vercel-ip-timezone') || 'Asia/Kolkata';

  // Dynamic Localization Rules Engine
  let currency = 'INR';
  let locale = 'en-IN';

  // Gulf Cooperation Council (GCC) Region
  if (country === 'AE' || country === 'SA' || country === 'QA') {
    currency = 'AED';
    locale = 'ar-AE';
  } 
  // European Union Region
  else if (country === 'GB' || country === 'DE' || country === 'FR') {
    currency = 'EUR';
    locale = 'en-EU';
  } 
  // North America
  else if (country === 'US' || country === 'CA') {
    currency = 'USD';
    locale = 'en-US';
  }

  // Inject localized preferences straight into the HTTP Cookies.
  response.cookies.set('klmce_locale', locale, { path: '/' });
  response.cookies.set('klmce_currency', currency, { path: '/' });
  response.cookies.set('klmce_timezone', timezone, { path: '/' });
  
  // Forward the sanitized headers down to the FastAPI backend for PDF report generation
  response.headers.set('x-klmce-locale', locale);

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Clerk proxy route
    '/__clerk/:path*',
  ],
};
