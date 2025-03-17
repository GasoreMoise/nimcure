import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateUser } from '@/lib/auth';
import type { LoginRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user and check email verification
    const user = await validateUser(body.email, body.password);

    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in',
          needsVerification: true 
        },
        { status: 401 }
      );
    }

    // Create auth cookie
    const cookieStore = cookies();
    cookieStore.set('auth', JSON.stringify({ email: user.email }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Return success response with user data
    return NextResponse.json(user);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}
