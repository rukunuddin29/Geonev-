import { Router } from "express";

import {
  createParking,
  getMyParkings,
  updateParking,
  deleteParking,
} from "../controllers/host.parking.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireHost } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  createParkingSchema,
  updateParkingSchema,
} from "../validators/parking.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  requireHost,
  validate(createParkingSchema),
  createParking
);

router.get(
  "/",
  authenticate,
  requireHost,
  getMyParkings
);

router.patch(
  "/:id",
  authenticate,
  requireHost,
  validate(updateParkingSchema),
  updateParking
);

router.delete(
  "/:id",
  authenticate,
  requireHost,
  deleteParking
);

export default router;