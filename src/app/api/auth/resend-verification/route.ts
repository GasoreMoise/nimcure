import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({ message: 'If an account exists, a verification email has been sent' });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID();

    // Update user with new token
    await prisma.user.update({
      where: { email },
      data: { verificationToken }
    });

    // Send verification email
    await sendVerificationEmail({
      email,
      token: verificationToken
    });

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 