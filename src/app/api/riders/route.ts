import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('Attempting to fetch riders from database...');
    
    const riders = await prisma.rider.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        rating: true,
        totalDeliveries: true,
        successRate: true,
        vehicleType: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log('Riders fetched successfully:', riders);
    return NextResponse.json(riders);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch riders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rider = await prisma.rider.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        vehicleType: body.vehicleType,
        status: 'available',
        rating: 0,
        totalDeliveries: 0,
        successRate: 0,
      },
    });
    return NextResponse.json(rider);
  } catch (error) {
    console.error('Create rider error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create rider',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}