import { Router } from "express";

import { getParkings, getParkingById } from "../controllers/parking.controller";
import {
  getReviews,
  upsertReview,
  toggleFavorite,
  getMyFavorites,
} from "../controllers/review.controller";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { reviewSchema } from "../validators/booking.validator";

const router = Router();

router.get("/", getParkings);

// Must be declared before "/:id" so "me" isn't treated as an id.
router.get("/me/favorites", authenticate, getMyFavorites);

router.get("/:id", getParkingById);

router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", authenticate, validate(reviewSchema), upsertReview);
router.post("/:id/favorite", authenticate, toggleFavorite);

export default router;