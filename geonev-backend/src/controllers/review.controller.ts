import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { HttpError, getPagination, handleError, pageMeta, param } from "../lib/http";

const requireAuth = (req: AuthRequest): string => {
  if (!req.auth) throw new HttpError(401, "Authentication required");
  return req.auth.userId;
};

// GET /api/parkings/:id/reviews
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const parkingId = param(req.params.id);
    const { page, limit, skip } = getPagination(req.query as Record<string, unknown>, 10);

    const [total, data] = await prisma.$transaction([
      prisma.review.count({ where: { parkingId } }),
      prisma.review.findMany({
        where: { parkingId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    res.status(200).json({ success: true, data, meta: pageMeta(total, page, limit) });
  } catch (error) {
    handleError(res, error, "Get reviews error", "Failed to fetch reviews");
  }
};

// POST /api/parkings/:id/reviews   body: { rating: 1-5, comment? }
// Only users with a COMPLETED booking at this station can review. One review per user.
export const upsertReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const parkingId = param(req.params.id);
    const { rating, comment } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { parkingId, userId, status: "COMPLETED" },
      orderBy: { endTime: "desc" },
    });
    if (!booking) {
      throw new HttpError(403, "You can review a station only after completing a booking there");
    }

    const review = await prisma.$transaction(async (tx) => {
      const saved = await tx.review.upsert({
        where: { parkingId_userId: { parkingId, userId } },
        create: { parkingId, userId, rating, comment: comment ?? null, bookingId: booking.id },
        update: { rating, comment: comment ?? null },
      });

      const agg = await tx.review.aggregate({
        where: { parkingId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.parking.update({
        where: { id: parkingId },
        data: {
          avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count._all,
        },
      });

      return saved;
    });

    res.status(200).json({ success: true, message: "Review saved", data: review });
  } catch (error) {
    handleError(res, error, "Upsert review error", "Failed to save review");
  }
};

// POST /api/parkings/:id/favorite  (toggles)
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);
    const parkingId = param(req.params.id);

    const parking = await prisma.parking.findFirst({ where: { id: parkingId, isActive: true } });
    if (!parking) throw new HttpError(404, "Parking station not found");

    const key = { userId_parkingId: { userId, parkingId } };
    const existing = await prisma.favorite.findUnique({ where: key });

    if (existing) {
      await prisma.favorite.delete({ where: key });
    } else {
      await prisma.favorite.create({ data: { userId, parkingId } });
    }

    res.status(200).json({ success: true, data: { isFavorite: !existing } });
  } catch (error) {
    handleError(res, error, "Toggle favorite error", "Failed to update favorite");
  }
};

// GET /api/parkings/me/favorites
export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = requireAuth(req);

    const rows = await prisma.favorite.findMany({
      where: { userId, parking: { isActive: true } },
      orderBy: { createdAt: "desc" },
      include: { parking: true },
    });

    res.status(200).json({ success: true, data: rows.map((r) => r.parking) });
  } catch (error) {
    handleError(res, error, "Get favorites error", "Failed to fetch favorites");
  }
};