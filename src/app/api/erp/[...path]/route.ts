import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
async function proxy(request: NextRequest, context: {params: Promise<{path: string[]}>}) {
  const {path} = await context.params;
  if (!['auth','students','attendance','exams','timetable','analytics'].includes(path[0]) || path.some(x => !/^[a-zA-Z0-9_-]+$/.test(x)))
    return NextResponse.json({detail:'Route not available'}, {status:404});
  if (!['GET','HEAD'].includes(request.method) && request.headers.get('origin') !== request.nextUrl.origin)
    return NextResponse.json({detail:'Untrusted request origin'}, {status:403});
  const session = await auth();
  if (!session.userId) return NextResponse.json({detail:'Sign in required'}, {status:401});
  const token = await session.getToken();
  const base = process.env.ERP_API_URL;
  if (!token || !base) return NextResponse.json({detail:'ERP session unavailable'}, {status:503});
  const body = request.method === 'GET' ? undefined : await request.text();
  if (body && new TextEncoder().encode(body).length > 1024*1024)
    return NextResponse.json({detail:'Request too large'}, {status:413});
  try {
    const response = await fetch(`${base.replace(/\/$/,'')}/${path.join('/')}${request.nextUrl.search}`, {
      method:request.method, body, cache:'no-store', redirect:'error', signal:AbortSignal.timeout(15000),
      headers:{Authorization:`Bearer ${token}`,'Content-Type':request.headers.get('content-type') || 'application/json'},
    });
    if (response.status >= 500) return NextResponse.json({detail:'ERP service unavailable'}, {status:503});
    return new NextResponse(await response.text(), {status:response.status, headers:{
      'Content-Type':'application/json','Cache-Control':'no-store',
      ...(response.headers.get('retry-after') ? {'Retry-After':response.headers.get('retry-after')!} : {})
    }});
  } catch { return NextResponse.json({detail:'ERP service unavailable'}, {status:503}); }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
