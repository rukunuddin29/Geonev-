import { z } from "zod";

export const createBookingSchema = z.object({
  parkingId: z.string().min(1),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  vehicleNumber: z.string().trim().max(20).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
});

export const hostBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).nullable().optional(),
});