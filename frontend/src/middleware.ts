import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This code executes in sub-10 milliseconds at the physical CDN Edge Node 
  // (e.g., inside the Vercel / Cloudflare edge server) before hitting the React container.
  
  const response = NextResponse.next();

  // Extract Anycast Geolocation headers injected by the Edge router
  const country = request.headers.get('x-vercel-ip-country') || 'IN';
  const timezone = request.headers.get('x-vercel-ip-timezone') || 'Asia/Kolkata';

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
  // The React UI will instantly render monetary ledgers (e.g., fee_transactions) 
  // in the local currency and timezone format without waiting for a backend DB query.
  response.cookies.set('klmce_locale', locale, { path: '/' });
  response.cookies.set('klmce_currency', currency, { path: '/' });
  response.cookies.set('klmce_timezone', timezone, { path: '/' });
  
  // Forward the sanitized headers down to the FastAPI backend for PDF report generation
  response.headers.set('x-klmce-locale', locale);

  return response;
}

export const config = {
  // Apply this Edge Middleware to all Next.js routes
  matcher: '/:path*',
};
