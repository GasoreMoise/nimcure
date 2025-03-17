import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Registration request:', body); // Debug log

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'licenseNumber', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const verificationToken = crypto.randomUUID();
    const hashedPassword = await hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        licenseNumber: body.licenseNumber,
        password: hashedPassword,
        verificationToken
      }
    });

    console.log('User created:', user); // Debug log

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      token: verificationToken
    });

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
