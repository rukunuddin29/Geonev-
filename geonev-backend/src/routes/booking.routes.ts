import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHostBookings,
  updateBookingStatus,
} from "../controllers/booking.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireHost } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createBookingSchema,
  hostBookingStatusSchema,
} from "../validators/booking.validator";

// ---------- Driver / user side: mounted at /api/bookings ----------
const router = Router();

router.use(authenticate);

router.post("/", validate(createBookingSchema), createBooking);
router.get("/", getMyBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

// ---------- Host side: mounted at /api/host/bookings ----------
export const hostBookingRouter = Router();

hostBookingRouter.use(authenticate, requireHost);

hostBookingRouter.get("/", getHostBookings);
hostBookingRouter.patch("/:id/status", validate(hostBookingStatusSchema), updateBookingStatus);

export default router;