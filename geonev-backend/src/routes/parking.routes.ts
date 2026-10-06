import { Router } from "express";

import {
  getParkings,
  getParkingById,
} from "../controllers/parking.controller";

const router = Router();

router.get("/", getParkings);
router.get("/:id", getParkingById);

export default router;