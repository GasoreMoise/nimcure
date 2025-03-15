import { z } from 'zod';

export const drugCycleSchema = z.object({
  cycleLength: z.string().min(1, 'Cycle length is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
});

export const riderAssignmentSchema = z.object({
  riderId: z.string().min(1, 'Rider selection is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  specialInstructions: z.string().optional(),
});

export type DrugCycleData = z.infer<typeof drugCycleSchema>;
export type RiderAssignmentData = z.infer<typeof riderAssignmentSchema>; 