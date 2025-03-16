import { NextResponse } from 'next/server';

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