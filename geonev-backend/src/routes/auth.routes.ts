import { Router } from "express";

import {
  register,
  login,
  me,
  forgotPassword,
  verifyOtp,
  resetPasswordController,
  requestPhoneOtpController,
  verifyPhoneOtpController,
} from "../controllers/auth.controller";

import { validate } from "../middleware/validate.middleware";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  requestPhoneOtpSchema,
  verifyPhoneOtpSchema,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController
);

/* PHONE OTP AUTH */

router.post(
  "/phone/request-otp",
  validate(requestPhoneOtpSchema),
  requestPhoneOtpController
);

router.post(
  "/phone/verify-otp",
  validate(verifyPhoneOtpSchema),
  verifyPhoneOtpController
);

export default router;