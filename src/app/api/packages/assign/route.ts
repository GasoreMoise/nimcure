import { NextResponse } from 'next/server';
import { z } from 'zod';
import { drugCycleSchema, riderAssignmentSchema } from '@/lib/validations/package.schema';

const assignPackageSchema = z.object({
  patientId: z.string(),
  packageId: z.string(),
  drugCycle: drugCycleSchema,
  riderAssignment: riderAssignmentSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = assignPackageSchema.parse(body);

    // Here you would typically:
    // 1. Save drug cycle information
    // 2. Create rider assignment
    // 3. Update package status
    // 4. Send notifications

    return NextResponse.json({ 
      message: 'Package assigned successfully',
      data: validatedData 
    });
  } catch (error) {
    console.error('Package assignment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign package' },
      { status: 400 }
    );
  }
} 