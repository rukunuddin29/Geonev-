import argon2 from "argon2";
import prisma from "../config/prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { generateOtp, getOtpExpiry } from "../utils/otp";
import { sendPasswordResetOtp } from "./mail.service";
import crypto from "crypto";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await argon2.hash(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

export const requestPhoneOtp = async (phone: string) => {
  // Remove old OTPs for this phone
  await prisma.phoneOtp.deleteMany({
    where: {
      phone,
      purpose: "LOGIN",
    },
  });

  // Generate a new OTP
  const otp = generateOtp();

  // Hash OTP before storing it
  const otpHash = await argon2.hash(otp);

  // Store OTP
  await prisma.phoneOtp.create({
    data: {
      phone,
      otpHash,
      purpose: "LOGIN",
      expiresAt: getOtpExpiry(),
    },
  });

  // DEVELOPMENT ONLY
  console.log(`📱 OTP for ${phone}: ${otp}`);

  return {
    message: "OTP sent successfully",
  };
};

export const verifyPhoneOtp = async (
  phone: string,
  otp: string,
  name?: string
) => {
  const otpRecord = await prisma.phoneOtp.findFirst({
    where: {
      phone,
      purpose: "LOGIN",
      verified: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw new Error("OTP not found or already used");
  }

  if (otpRecord.expiresAt < new Date()) {
    await prisma.phoneOtp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    throw new Error("OTP has expired");
  }

  if (otpRecord.attempts >= 5) {
    throw new Error("Too many OTP attempts");
  }

  const isValidOtp = await argon2.verify(
    otpRecord.otpHash,
    otp
  );

  if (!isValidOtp) {
    await prisma.phoneOtp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Invalid OTP");
  }

  // Mark OTP as verified
  await prisma.phoneOtp.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      verified: true,
    },
  });

  // Find existing user
  let user = await prisma.user.findFirst({
    where: {
      phone,
    },
  });

  let isNewUser = false;

  // Create account if phone doesn't exist
  if (!user) {
    if (!name) {
      throw new Error("Name is required for new users");
    }

    user = await prisma.user.create({
      data: {
        name,
        phone,
        email: `${phone.replace(/\D/g, "")}@phone.geonev.local`,
        passwordHash: "",
        role: "USER",
      },
    });

    isNewUser = true;
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshToken = generateRefreshToken(
    user.id
  );

  // Delete OTP after successful login
  await prisma.phoneOtp.delete({
    where: {
      id: otpRecord.id,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
    isNewUser,
    accessToken,
    refreshToken,
  };
};


export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User account is not active");
  }

  const passwordValid = await argon2.verify(
    user.passwordHash,
    data.password
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  /*
   * We intentionally don't reveal whether an email exists.
   * This prevents account enumeration.
   */
  if (!user) {
    return;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  const otpHash = await argon2.hash(otp);

  await prisma.passwordResetOtp.deleteMany({
    where: {
      email,
    },
  });

  await prisma.passwordResetOtp.create({
    data: {
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendPasswordResetOtp(email, otp);
};

export const verifyPasswordResetOtp = async (
  email: string,
  otp: string
) => {
  const resetRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      email,
      verified: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetRecord) {
    throw new Error("Invalid or expired OTP");
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  if (resetRecord.attempts >= 5) {
    throw new Error("Too many OTP attempts");
  }

  const validOtp = await argon2.verify(
    resetRecord.otpHash,
    otp
  );

  if (!validOtp) {
    await prisma.passwordResetOtp.update({
      where: {
        id: resetRecord.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new Error("Invalid OTP");
  }

  await prisma.passwordResetOtp.update({
    where: {
      id: resetRecord.id,
    },
    data: {
      verified: true,
    },
  });
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const resetRecord = await prisma.passwordResetOtp.findFirst({
    where: {
      email,
      verified: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetRecord) {
    throw new Error("OTP verification required");
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  await prisma.passwordResetOtp.delete({
    where: {
      id: resetRecord.id,
    },
  });
};