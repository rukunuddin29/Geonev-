import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getBookedCounts } from "../lib/availability";
import {
  HttpError,
  getPagination,
  handleError,
  haversineKm,
  pageMeta,
  param,
  qdate,
  qlist,
  qnum,
  qstr,
} from "../lib/http";

const SPOT_TYPES = ["CAR", "BIKE", "TRUCK", "EV_CHARGING"] as const;
const CHARGER_TYPES = ["NONE", "AC", "DC", "BOTH"] as const;

const MEMORY_CAP = 500; // max rows loaded when filtering in memory

/**
 * GET /api/parkings
 *
 * Query params (all optional):
 *  q, city, spotType, chargerType, amenities=a,b, minPrice, maxPrice, minRating,
 *  lat, lng, radiusKm (default 10), startTime, endTime, availableOnly=true,
 *  sort=newest|price_asc|price_desc|rating|distance, page, limit
 */
export const getParkings = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as Record<string, unknown>;
    const { page, limit, skip } = getPagination(query);

    const q = qstr(query.q);
    const city = qstr(query.city);
    const spotType = qstr(query.spotType)?.toUpperCase();
    const chargerType = qstr(query.chargerType)?.toUpperCase();
    const amenities = qlist(query.amenities);
    const minPrice = qnum(query.minPrice);
    const maxPrice = qnum(query.maxPrice);
    const minRating = qnum(query.minRating);
    const lat = qnum(query.lat);
    const lng = qnum(query.lng);
    const radiusKm = qnum(query.radiusKm) ?? 10;
    const sort = qstr(query.sort) ?? (lat !== undefined && lng !== undefined ? "distance" : "newest");
    const availableOnly = query.availableOnly === "true";

    const now = new Date();
    const startTime = qdate(query.startTime) ?? now;
    const endTime = qdate(query.endTime) ?? new Date(startTime.getTime() + 60 * 1000);
    if (endTime <= startTime) throw new HttpError(400, "endTime must be after startTime");

    const where: Prisma.ParkingWhereInput = { isActive: true };

    if (city) where.city = { equals: city, mode: "insensitive" };
    if (spotType) {
      if (!(SPOT_TYPES as readonly string[]).includes(spotType)) {
        throw new HttpError(400, `spotType must be one of ${SPOT_TYPES.join(", ")}`);
      }
      where.spotType = spotType as (typeof SPOT_TYPES)[number];
    }
    if (chargerType) {
      if (!(CHARGER_TYPES as readonly string[]).includes(chargerType)) {
        throw new HttpError(400, `chargerType must be one of ${CHARGER_TYPES.join(", ")}`);
      }
      where.chargerType = chargerType as (typeof CHARGER_TYPES)[number];
    }
    if (amenities.length) where.amenities = { hasEvery: amenities };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerHour = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }
    if (minRating !== undefined) where.avgRating = { gte: minRating };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const hasGeo = lat !== undefined && lng !== undefined;
    if (hasGeo) {
      // Bounding box narrows the DB query; haversine does the exact filter below.
      const dLat = radiusKm / 111;
      const dLng = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
      where.latitude = { gte: lat - dLat, lte: lat + dLat };
      where.longitude = { gte: lng - dLng, lte: lng + dLng };
    }

    const orderBy: Prisma.ParkingOrderByWithRelationInput[] =
      sort === "price_asc"
        ? [{ pricePerHour: "asc" }]
        : sort === "price_desc"
        ? [{ pricePerHour: "desc" }]
        : sort === "rating"
        ? [{ avgRating: "desc" }, { reviewCount: "desc" }]
        : [{ createdAt: "desc" }];

    const include = {
      host: { select: { id: true, name: true } },
    } satisfies Prisma.ParkingInclude;

    const needsMemory = hasGeo || availableOnly;

    // ---------- Fast path: DB pagination ----------
    if (!needsMemory) {
      const [total, rows] = await prisma.$transaction([
        prisma.parking.count({ where }),
        prisma.parking.findMany({ where, orderBy, skip, take: limit, include }),
      ]);

      const booked = await getBookedCounts(rows.map((p) => p.id), startTime, endTime);
      const data = rows.map((p) => {
        const availableSlots = Math.max(0, p.totalSlots - (booked.get(p.id) ?? 0));
        return { ...p, availableSlots, isBooked: availableSlots === 0 };
      });

      res.status(200).json({ success: true, data, meta: pageMeta(total, page, limit) });
      return;
    }

    // ---------- Memory path: geo and/or availability filtering ----------
    const rows = await prisma.parking.findMany({
      where,
      orderBy,
      take: MEMORY_CAP,
      include,
    });

    const booked = await getBookedCounts(rows.map((p) => p.id), startTime, endTime);

    let enriched = rows.map((p) => {
      const availableSlots = Math.max(0, p.totalSlots - (booked.get(p.id) ?? 0));
      const distanceKm = hasGeo
        ? Math.round(haversineKm(lat!, lng!, p.latitude, p.longitude) * 100) / 100
        : undefined;
      return { ...p, availableSlots, isBooked: availableSlots === 0, distanceKm };
    });

    if (hasGeo) enriched = enriched.filter((p) => (p.distanceKm ?? Infinity) <= radiusKm);
    if (availableOnly) enriched = enriched.filter((p) => p.availableSlots > 0);
    if (hasGeo && sort === "distance") {
      enriched.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    const total = enriched.length;
    const data = enriched.slice(skip, skip + limit);

    res.status(200).json({ success: true, data, meta: pageMeta(total, page, limit) });
  } catch (error) {
    handleError(res, error, "Get parkings error", "Failed to fetch parking stations");
  }
};

/**
 * GET /api/parkings/:id?startTime=&endTime=
 * Returns the station, host info, latest reviews and live availability.
 */
export const getParkingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = param(req.params.id);
    const startTime = qdate(req.query.startTime) ?? new Date();
    const endTime = qdate(req.query.endTime) ?? new Date(startTime.getTime() + 60 * 1000);
    if (endTime <= startTime) throw new HttpError(400, "endTime must be after startTime");

    const parking = await prisma.parking.findFirst({
      where: { id, isActive: true },
      include: {
        host: { select: { id: true, name: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!parking) throw new HttpError(404, "Parking station not found");

    const booked = await getBookedCounts([parking.id], startTime, endTime);
    const availableSlots = Math.max(0, parking.totalSlots - (booked.get(parking.id) ?? 0));

    res.status(200).json({
      success: true,
      data: { ...parking, availableSlots, isBooked: availableSlots === 0 },
    });
  } catch (error) {
    handleError(res, error, "Get parking by ID error", "Failed to fetch parking station");
  }
};