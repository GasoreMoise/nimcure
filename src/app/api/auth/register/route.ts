import { NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import type { RegisterRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'licenseNumber', 'password'];
    for (const field of requiredFields) {
      if (!body[field as keyof RegisterRequest]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = await createUser(body);

    // Return success response without setting auth cookie
    return NextResponse.json(
      { 
        message: 'Registration successful. Please log in to continue.',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
