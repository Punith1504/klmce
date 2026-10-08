import 'server-only';
import { auth } from '@clerk/nextjs/server';

export type Principal = { sub: string; tenant_id: string; role: string };
export async function serverApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await auth();
  if (!session.userId) throw new Error('Sign in to continue');
  const token = await session.getToken();
  if (!token) throw new Error('Session expired; sign in again');
  const base = process.env.ERP_API_URL;
  if (!base) throw new Error('ERP connection is not configured');
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Invalid ERP path');
  const response = await fetch(base.replace(/\/$/, '') + path, {
    ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Session or account unavailable; sign in again',
      403: 'You do not have permission, or recent second-factor verification is required',
      404: 'Record not found', 409: 'A conflicting record exists; refresh and review it',
      422: 'The submitted data does not meet the required rules',
      429: 'Too many requests; please retry later', 503: 'This service is temporarily unavailable',
    };
    throw new Error(messages[response.status] || 'The request could not be completed');
  }
  return response.json() as Promise<T>;
}

export async function requireRole(...roles: string[]): Promise<Principal> {
  const principal = await serverApi<Principal>('/auth/me');
  if (!roles.includes(principal.role)) throw new Error('You do not have permission for this action');
  return principal;
}
