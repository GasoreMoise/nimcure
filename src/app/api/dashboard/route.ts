import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');

    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(authCookie.value);

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userData.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        licenseNumber: true,
        createdAt: true
      }
    });

    // Fetch statistics
    const stats = await prisma.$transaction([
      prisma.delivery.count({
        where: { status: 'PENDING' }
      }),
      prisma.delivery.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.delivery.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.patient.count(),
      prisma.rider.count()
    ]);

    // Fetch recent deliveries with full details
    const recentDeliveries = await prisma.delivery.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        rider: true
      }
    });

    // Fetch top performing riders
    const topRiders = await prisma.rider.findMany({
      take: 5,
      orderBy: [
        { successRate: 'desc' },
        { totalDeliveries: 'desc' }
      ]
    });

    // Fetch recent patients
    const recentPatients = await prisma.patient.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    // Calculate delivery success rate
    const totalDeliveries = stats[0] + stats[1] + stats[2];
    const successRate = totalDeliveries > 0 
      ? (stats[2] / totalDeliveries) * 100 
      : 0;

    return NextResponse.json({
      currentUser,
      stats: {
        pendingDeliveries: stats[0],
        activeDeliveries: stats[1],
        completedDeliveries: stats[2],
        totalPatients: stats[3],
        totalRiders: stats[4],
        totalDeliveries,
        successRate: Math.round(successRate * 100) / 100
      },
      recentDeliveries,
      topRiders,
      recentPatients,
      systemHealth: {
        lastUpdated: new Date().toISOString(),
        status: 'operational'
      }
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 