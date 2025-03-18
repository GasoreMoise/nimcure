import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function isAuthenticated(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    return !!token;
  } catch {
    return false;
  }
}

export async function isAdmin(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    return token?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export function getRedirectUrl(role: string = 'USER') {
  return role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
} 