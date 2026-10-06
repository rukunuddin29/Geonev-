import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h)");

const parkingFields = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  address: z.string().trim().min(3).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).nullable().optional(),
  pincode: z.string().trim().max(12).nullable().optional(),

  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),

  spotType: z.enum(["CAR", "BIKE", "TRUCK", "EV_CHARGING"]),
  totalSlots: z.coerce.number().int().min(1).max(1000),
  pricePerHour: z.coerce.number().min(0).max(100000),
  pricePerDay: z.coerce.number().min(0).max(1000000).nullable().optional(),

  chargerType: z.enum(["NONE", "AC", "DC", "BOTH"]).optional(),
  powerKw: z.coerce.number().positive().max(1000).nullable().optional(),
  connectorTypes: z.array(z.string().trim().min(1).max(30)).max(10).optional(),

  images: z.array(z.string().url()).max(10).optional(),
  amenities: z.array(z.string().trim().min(1).max(40)).max(30).optional(),

  isOpen24x7: z.boolean().optional(),
  openTime: time.nullable().optional(),
  closeTime: time.nullable().optional(),
  instantBooking: z.boolean().optional(),
});

type ParkingInput = z.infer<typeof parkingFields>;

const crossChecks = (d: Partial<ParkingInput>, ctx: z.RefinementCtx) => {
  if (d.spotType === "EV_CHARGING") {
    if (!d.chargerType || d.chargerType === "NONE") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["chargerType"],
        message: "EV charging stations need a chargerType (AC, DC or BOTH)",
      });
    }
  }
  if (d.isOpen24x7 === false && (!d.openTime || !d.closeTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["openTime"],
      message: "openTime and closeTime are required when the station is not open 24x7",
    });
  }
};

export const createParkingSchema = parkingFields.superRefine(crossChecks);

export const updateParkingSchema = parkingFields
  .partial()
  .superRefine((d, ctx) => {
    if (Object.keys(d).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Send at least one field to update" });
    }
    crossChecks(d, ctx);
  });

export const parkingStatusSchema = z.object({ isActive: z.boolean() });