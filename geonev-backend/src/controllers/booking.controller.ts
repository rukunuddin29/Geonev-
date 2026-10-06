import { Response } from "express";
import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { BLOCKING_STATUSES, calculatePrice } from "../lib/availability";
import {
  HttpError,
  getPagination,
  handleError,
  pageMeta,
  param,
  qstr,
} from "../lib/http";

const MAX_STAY_HOURS = 24 * 30;
const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"] as const;

const requireAuth = (req: AuthRequest): string => {
  if (!req.auth) throw new HttpError(401, "Authentication required");
  return req.auth.userId;
};

const parseStatusFilter = (value: unknown): BookingStatus | undefined => {
  const s = qstr(value)?.toUpperCase();
  if (!s) return undefined;
  if (!(STATUSES as readonly string[]).includes(s)) {
    throw new HttpError(400, `status must be one of ${STATUSES.join(", ")}`);
  }
  return s as BookingStatus;
};

const parkingSummary = {
  select: { id: true, name: true, address: true, city: true, images: true, spotType: true },
} as const;

// POST /api/bookings
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const { parkingId, startTime, endTime, vehicleNumber, note } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new HttpError(400, "Invalid startTime or endTime");
    }
    if (start.getTime() < Date.now() - 60 * 1000) {
      throw new HttpError(400, "startTime cannot be in the past");
    }
    if (end <= start) throw new HttpError(400, "endTime must be after startTime");

    const hours = (end.getTime() - start.getTime()) / 36e5;
    if (hours > MAX_STAY_HOURS) {
      throw new HttpError(400, `Maximum booking length is ${MAX_STAY_HOURS / 24} days`);
    }

    const parking = await prisma.parking.findFirst({ where: { id: parkingId, isActive: true } });
    if (!parking) throw new HttpError(404, "Parking station not found");
    if (parking.hostId === userId) {
      throw new HttpError(400, "You cannot book your own station");
    }

    const totalPrice = calculatePrice(hours, parking.pricePerHour, parking.pricePerDay);

    // Serializable transaction: two users cannot grab the last slot at once.
    const booking = await prisma.$transaction(
      async (tx) => {
        const taken = await tx.booking.count({
          where: {
            parkingId,
            status: { in: BLOCKING_STATUSES },
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (taken >= parking.totalSlots) {
          throw new HttpError(409, "No slots available for the selected time");
        }

        return tx.booking.create({
          data: {
            parkingId,
            userId,
            startTime: start,
            endTime: end,
            hours: Math.round(hours * 100) / 100,
            totalPrice,
            status: parking.instantBooking ? "CONFIRMED" : "PENDING",
            vehicleNumber: vehicleNumber ?? null,
            note: note ?? null,
          },
          include: { parking: parkingSummary },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    res.status(201).json({
      success: true,
      message:
        booking.status === "CONFIRMED"
          ? "Booking confirmed"
          : "Booking requested. Waiting for host approval",
      data: booking,
    });
  } catch (error) {
    // P2034 = serialization failure (another booking won the race)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      res.status(409).json({
        success: false,
        message: "Another booking was made at the same time. Please try again.",
      });
      return;
    }
    handleError(res, error, "Create booking error", "Failed to create booking");
  }
};

// GET /api/bookings?status=&page=&limit=
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const { page, limit, skip } = getPagination(req.query as Record<string, unknown>, 10);
    const status = parseStatusFilter(req.query.status);

    const where: Prisma.BookingWhereInput = { userId, ...(status && { status }) };

    const [total, data] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
        include: { parking: parkingSummary, review: { select: { id: true, rating: true } } },
      }),
    ]);

    res.status(200).json({ success: true, data, meta: pageMeta(total, page, limit) });
  } catch (error) {
    handleError(res, error, "Get my bookings error", "Failed to fetch bookings");
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const id = param(req.params.id);

    const booking = await prisma.booking.findFirst({
      where: { id, userId },
      include: { parking: parkingSummary, review: true },
    });
    if (!booking) throw new HttpError(404, "Booking not found");

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    handleError(res, error, "Get booking error", "Failed to fetch booking");
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const id = param(req.params.id);

    const booking = await prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new HttpError(404, "Booking not found");

    if (!BLOCKING_STATUSES.includes(booking.status)) {
      throw new HttpError(400, `A ${booking.status.toLowerCase()} booking cannot be cancelled`);
    }
    if (booking.startTime <= new Date()) {
      throw new HttpError(400, "This booking has already started and cannot be cancelled");
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        paymentStatus: booking.paymentStatus === "PAID" ? "REFUNDED" : booking.paymentStatus,
      },
    });

    res.status(200).json({ success: true, message: "Booking cancelled", data: updated });
  } catch (error) {
    handleError(res, error, "Cancel booking error", "Failed to cancel booking");
  }
};

// GET /api/host/bookings?status=&parkingId=&page=&limit=
export const getHostBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const { page, limit, skip } = getPagination(req.query as Record<string, unknown>, 10);
    const status = parseStatusFilter(req.query.status);
    const parkingId = qstr(req.query.parkingId);

    const where: Prisma.BookingWhereInput = {
      parking: { hostId },
      ...(status && { status }),
      ...(parkingId && { parkingId }),
    };

    const [total, data] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
        include: {
          parking: parkingSummary,
          user: { select: { id: true, name: true, phone: true } },
        },
      }),
    ]);

    res.status(200).json({ success: true, data, meta: pageMeta(total, page, limit) });
  } catch (error) {
    handleError(res, error, "Get host bookings error", "Failed to fetch bookings");
  }
};

// PATCH /api/host/bookings/:id/status   body: { status: CONFIRMED|REJECTED|CANCELLED|COMPLETED }
const HOST_TRANSITIONS: Record<string, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const id = param(req.params.id);
    const next = req.body.status as BookingStatus;

    const booking = await prisma.booking.findFirst({
      where: { id, parking: { hostId } },
    });
    if (!booking) throw new HttpError(404, "Booking not found");

    const allowed = HOST_TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(next)) {
      throw new HttpError(
        400,
        `Cannot change a ${booking.status} booking to ${next}` +
          (allowed.length ? `. Allowed: ${allowed.join(", ")}` : "")
      );
    }
    if (next === "COMPLETED" && booking.startTime > new Date()) {
      throw new HttpError(400, "A booking cannot be completed before it starts");
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: next,
        ...(next === "CANCELLED" || next === "REJECTED" ? { cancelledAt: new Date() } : {}),
        ...((next === "CANCELLED" || next === "REJECTED") && booking.paymentStatus === "PAID"
          ? { paymentStatus: "REFUNDED" as const }
          : {}),
      },
    });

    res.status(200).json({ success: true, message: `Booking ${next.toLowerCase()}`, data: updated });
  } catch (error) {
    handleError(res, error, "Update booking status error", "Failed to update booking");
  }
};