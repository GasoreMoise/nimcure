import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sessionStore } from '@/lib/sessionStore';

export async function GET() {
  try {
    const sessionId = cookies().get('session-id');
    
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const user = sessionStore.get(sessionId.value);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
} 