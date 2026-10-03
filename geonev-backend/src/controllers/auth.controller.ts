
import { Request, Response } from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  requestPhoneOtp,
  verifyPhoneOtp,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === "Invalid email or password" ||
        error.message === "User account is not active"
      )
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const me = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Me error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    await requestPasswordReset(req.body.email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response
) => {
  try {
    await verifyPasswordResetOtp(
      req.body.email,
      req.body.otp
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    await resetPassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

export const requestPhoneOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    await requestPhoneOtp(req.body.phone);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Request phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const verifyPhoneOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await verifyPhoneOtp(
      req.body.phone,
      req.body.otp,
      req.body.name
    );

    return res.status(200).json({
      success: true,
      message: "Phone authentication successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const clientErrors = [
        "OTP not found or already used",
        "OTP has expired",
        "Invalid OTP",
        "Too many OTP attempts",
        "Name is required for new users",
        "User account is not active",
      ];

      if (clientErrors.includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Verify phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};