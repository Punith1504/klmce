import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Edge runtime pre-processing
  const { userId } = await auth();

  // Allow institutional session cookie or Clerk session
  const hasInstitutionalSession = 
    req.cookies.has('klmce_session') || 
    req.cookies.has('klmce_role') || 
    req.cookies.has('klmce-demo-auth');

  // Protect non-public routes
  if (!isPublicRoute(req) && !userId && !hasInstitutionalSession) {
    // If neither Clerk nor institutional session is present, redirect to unified login
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  const response = NextResponse.next();

  // Extract Anycast Geolocation headers injected by Edge router
  const country = req.headers.get('x-vercel-ip-country') || 'IN';
  const timezone = req.headers.get('x-vercel-ip-timezone') || 'Asia/Kolkata';

  // Dynamic Localization Rules Engine
  let currency = 'INR';
  let locale = 'en-IN';

  if (country === 'AE' || country === 'SA' || country === 'QA') {
    currency = 'AED';
    locale = 'ar-AE';
  } else if (country === 'GB' || country === 'DE' || country === 'FR') {
    currency = 'EUR';
    locale = 'en-EU';
  } else if (country === 'US' || country === 'CA') {
    currency = 'USD';
    locale = 'en-US';
  }

  // Inject localized preferences
  response.cookies.set('klmce_locale', locale, { path: '/' });
  response.cookies.set('klmce_currency', currency, { path: '/' });
  response.cookies.set('klmce_timezone', timezone, { path: '/' });
  response.headers.set('x-klmce-locale', locale);

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Clerk proxy route
    '/__clerk/:path*',
  ],
};
