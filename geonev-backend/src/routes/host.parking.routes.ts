import { Router } from "express";

import {
  createParking,
  getMyParkings,
  getMyParkingById,
  getHostStats,
  updateParking,
  setParkingStatus,
  deleteParking,
} from "../controllers/host.parking.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireHost } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createParkingSchema,
  updateParkingSchema,
  parkingStatusSchema,
} from "../validators/parking.validator";

const router = Router();

router.use(authenticate, requireHost);

router.post("/", validate(createParkingSchema), createParking);
router.get("/", getMyParkings);

// Must be declared before "/:id" so "stats" isn't treated as an id.
router.get("/stats", getHostStats);

router.get("/:id", getMyParkingById);
router.patch("/:id", validate(updateParkingSchema), updateParking);
router.patch("/:id/status", validate(parkingStatusSchema), setParkingStatus);
router.delete("/:id", deleteParking);

export default router;