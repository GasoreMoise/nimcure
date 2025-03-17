import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/riders/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update rider:', error);
    return NextResponse.json(
      { error: 'Failed to update rider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/riders/${params.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to delete rider:', error);
    return NextResponse.json(
      { error: 'Failed to delete rider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const updatedRider = await prisma.rider.update({
      where: { id },
      data: {
        rating: body.rating
      },
      include: {
        deliveries: true
      }
    });

    // Get rider with deliveries
    const riderWithDeliveries = await prisma.rider.findUnique({
      where: { id },
      include: {
        deliveries: true
      }
    });

    // Calculate success rate
    const totalDeliveries = riderWithDeliveries?.deliveries?.length || 0;
    const completedDeliveries = riderWithDeliveries?.deliveries?.filter(
      d => d.status === 'completed'
    ).length || 0;
    
    const successRate = totalDeliveries > 0 
      ? (completedDeliveries / totalDeliveries) * 100 
      : 0;

    // Update success rate
    await prisma.rider.update({
      where: { id },
      data: { 
        successRate,
        totalDeliveries 
      }
    });

    return NextResponse.json({ success: true, data: updatedRider });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rider' },
      { status: 500 }
    );
  }
}

// Also allow GET requests
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    // Here you would typically fetch from your database
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rider' },
      { status: 500 }
    );
  }
} 