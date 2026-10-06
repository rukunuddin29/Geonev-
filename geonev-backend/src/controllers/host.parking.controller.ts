import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { BLOCKING_STATUSES } from "../lib/availability";
import { HttpError, handleError, param, round2 } from "../lib/http";

const requireAuth = (req: AuthRequest): string => {
  if (!req.auth) throw new HttpError(401, "Authentication required");
  return req.auth.userId;
};

/** Only these fields can ever be set by a host. */
const pickParkingFields = (body: Record<string, any>) => ({
  name: body.name,
  description: body.description,
  address: body.address,
  city: body.city,
  state: body.state,
  pincode: body.pincode,
  latitude: body.latitude,
  longitude: body.longitude,
  spotType: body.spotType,
  totalSlots: body.totalSlots,
  pricePerHour: body.pricePerHour,
  pricePerDay: body.pricePerDay,
  chargerType: body.chargerType,
  powerKw: body.powerKw,
  connectorTypes: body.connectorTypes,
  images: body.images,
  amenities: body.amenities,
  isOpen24x7: body.isOpen24x7,
  openTime: body.openTime,
  closeTime: body.closeTime,
  instantBooking: body.instantBooking,
});

const findOwned = async (id: string, hostId: string) => {
  const parking = await prisma.parking.findFirst({ where: { id, hostId } });
  if (!parking) throw new HttpError(404, "Parking station not found");
  return parking;
};

// POST /api/host/parkings
export const createParking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const f = pickParkingFields(req.body);

    const parking = await prisma.parking.create({
      data: {
        name: f.name,
        description: f.description ?? null,
        address: f.address,
        city: f.city,
        state: f.state || null,
        pincode: f.pincode ?? null,
        latitude: f.latitude,
        longitude: f.longitude,
        spotType: f.spotType,
        totalSlots: f.totalSlots,
        pricePerHour: f.pricePerHour,
        pricePerDay: f.pricePerDay ?? null,
        chargerType: f.chargerType || "NONE",
        powerKw: f.powerKw ?? null,
        connectorTypes: f.connectorTypes ?? [],
        images: f.images ?? [],
        amenities: f.amenities ?? [],
        isOpen24x7: f.isOpen24x7 ?? true,
        openTime: f.openTime ?? null,
        closeTime: f.closeTime ?? null,
        instantBooking: f.instantBooking ?? true,
        hostId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Parking station created successfully",
      data: parking,
    });
  } catch (error) {
    handleError(res, error, "Create parking error", "Failed to create parking station");
  }
};

// GET /api/host/parkings
export const getMyParkings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);

    const parkings = await prisma.parking.findMany({
      where: { hostId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true, reviews: true, favorites: true } } },
    });

    res.status(200).json({ success: true, data: parkings });
  } catch (error) {
    handleError(res, error, "Get my parkings error", "Failed to fetch your parking stations");
  }
};

// GET /api/host/parkings/stats
export const getHostStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const now = new Date();

    const [totalParkings, activeParkings, bookingStats, upcoming, pending, revenue] =
      await Promise.all([
        prisma.parking.count({ where: { hostId } }),
        prisma.parking.count({ where: { hostId, isActive: true } }),
        prisma.booking.groupBy({
          by: ["status"],
          where: { parking: { hostId } },
          _count: { _all: true },
        }),
        prisma.booking.count({
          where: { parking: { hostId }, status: "CONFIRMED", startTime: { gt: now } },
        }),
        prisma.booking.count({ where: { parking: { hostId }, status: "PENDING" } }),
        prisma.booking.aggregate({
          where: { parking: { hostId }, status: "COMPLETED" },
          _sum: { totalPrice: true },
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalParkings,
        activeParkings,
        upcomingBookings: upcoming,
        pendingApprovals: pending,
        totalRevenue: round2(revenue._sum.totalPrice ?? 0),
        bookingsByStatus: Object.fromEntries(
          bookingStats.map((b) => [b.status, b._count._all])
        ),
      },
    });
  } catch (error) {
    handleError(res, error, "Host stats error", "Failed to fetch host statistics");
  }
};

// GET /api/host/parkings/:id
export const getMyParkingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const id = param(req.params.id);

    const parking = await prisma.parking.findFirst({
      where: { id, hostId },
      include: { _count: { select: { bookings: true, reviews: true, favorites: true } } },
    });
    if (!parking) throw new HttpError(404, "Parking station not found");

    res.status(200).json({ success: true, data: parking });
  } catch (error) {
    handleError(res, error, "Get my parking error", "Failed to fetch parking station");
  }
};

// PATCH /api/host/parkings/:id
export const updateParking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const id = param(req.params.id);
    const existing = await findOwned(id, hostId);

    const fields = pickParkingFields(req.body);

    // Don't let a host shrink capacity below slots already committed to future bookings.
    if (fields.totalSlots !== undefined && fields.totalSlots < existing.totalSlots) {
      const peak = await prisma.booking.count({
        where: {
          parkingId: id,
          status: { in: BLOCKING_STATUSES },
          endTime: { gt: new Date() },
        },
      });
      if (peak > fields.totalSlots) {
        throw new HttpError(
          409,
          "Cannot reduce slots below the number of upcoming bookings. Cancel or complete them first."
        );
      }
    }

    // Prisma ignores undefined, so partial updates only touch what was sent.
    const parking = await prisma.parking.update({ where: { id }, data: fields });

    res.status(200).json({
      success: true,
      message: "Parking station updated successfully",
      data: parking,
    });
  } catch (error) {
    handleError(res, error, "Update parking error", "Failed to update parking station");
  }
};

// PATCH /api/host/parkings/:id/status   body: { isActive: boolean }
export const setParkingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const id = param(req.params.id);
    await findOwned(id, hostId);

    if (typeof req.body.isActive !== "boolean") {
      throw new HttpError(400, "isActive must be true or false");
    }

    const parking = await prisma.parking.update({
      where: { id },
      data: { isActive: req.body.isActive },
    });

    res.status(200).json({
      success: true,
      message: parking.isActive ? "Station is now visible" : "Station hidden from search",
      data: parking,
    });
  } catch (error) {
    handleError(res, error, "Set parking status error", "Failed to update station status");
  }
};

// DELETE /api/host/parkings/:id
export const deleteParking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hostId = requireAuth(req);
    const id = param(req.params.id);
    await findOwned(id, hostId);

    const upcoming = await prisma.booking.count({
      where: {
        parkingId: id,
        status: { in: BLOCKING_STATUSES },
        endTime: { gt: new Date() },
      },
    });
    if (upcoming > 0) {
      throw new HttpError(
        409,
        "This station has upcoming bookings. Cancel them first, or hide the station instead."
      );
    }

    await prisma.parking.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Parking station deleted successfully" });
  } catch (error) {
    handleError(res, error, "Delete parking error", "Failed to delete parking station");
  }
};