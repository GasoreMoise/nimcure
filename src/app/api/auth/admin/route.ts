import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const admin = await prisma.user.findUnique({
      where: { 
        email,
        role: 'ADMIN'
      }
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { password: _, ...adminWithoutPassword } = admin;
    return NextResponse.json({ user: adminWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 