import { z } from "zod";

export const createParkingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),

  state: z.string().optional(),

  latitude: z.number(),
  longitude: z.number(),

  spotType: z.enum([
    "CAR",
    "BIKE",
    "TRUCK",
    "EV_CHARGING",
  ]),

  totalSlots: z.number().int().positive(),

  pricePerHour: z.number().nonnegative(),

  chargerType: z
    .enum(["NONE", "AC", "DC", "BOTH"])
    .optional(),

  powerKw: z.number().nonnegative().optional(),

  images: z.array(z.string()).optional(),

  amenities: z.array(z.string()).optional(),
});

export const updateParkingSchema = createParkingSchema.partial();