import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Attempting to fetch admin overview data from database...');
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Direct database queries using Prisma
    const [patients, deliveries, riders] = await prisma.$transaction([
      // Get all patients with their related data
      prisma.patient.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          deliveries: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              items: true,
              location: true,
              createdAt: true
            }
          }
        }
      }),

      // Get all deliveries with their related data
      prisma.delivery.findMany({
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          items: true,
          location: true,
          notes: true,
          createdAt: true,
          patientId: true,
          riderId: true,
          tracking: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Get all riders with their delivery counts
      prisma.rider.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          vehicleType: true,
          rating: true,
          totalRatings: true,
          successRate: true,
          totalDeliveries: true,
          ratingHistory: true,
          _count: {
            select: {
              deliveries: true
            }
          }
        }
      })
    ]);

    console.log(`Database fetch complete:
      - ${patients.length} patients
      - ${deliveries.length} deliveries
      - ${riders.length} riders`);

    // Calculate statistics from raw database data
    const stats = {
      totalDeliveries: deliveries.length,
      totalPatients: patients.length,
      totalRiders: riders.length,
      completedDeliveries: deliveries.filter(d => d.status === 'DELIVERED').length,
      pendingDeliveries: deliveries.filter(d => d.status === 'PENDING').length,
      inProgressDeliveries: deliveries.filter(d => d.status === 'IN_PROGRESS').length,
      totalRevenue: deliveries.filter(d => d.paymentStatus === 'paid').length,
      activeRiders: riders.filter(r => r.status === 'active').length
    };

    return NextResponse.json({
      stats,
      deliveries,
      patients,
      riders,
      systemHealth: {
        lastUpdated: new Date().toISOString(),
        status: 'operational'
      }
    });

  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 