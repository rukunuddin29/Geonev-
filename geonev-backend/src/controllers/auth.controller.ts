import "dotenv/config";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import { UserRole } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { normalizePhone } from "../utils/phone";
import { AuthRequest } from "../middleware/auth.middleware";

const OTP_PURPOSE = "LOGIN";
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TTL_MS = 30 * 60 * 1000;

/* ───────────── Helpers ───────────── */

const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

const hashOtp = (phone: string, otp: string): string =>
  sha256(`${phone}:${otp}:${process.env.OTP_PEPPER ?? ""}`);

const toRole = (role: string | undefined): UserRole =>
  role === "HOST" ? UserRole.HOST : UserRole.USER;

const publicUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  provider: user.provider,
  isVerified: user.isVerified,
});

const sendAuth = (
  res: any,
  user: any,
  message: string,
  status = 200
): void => {
  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  res.status(status).json({
    success: true,
    message,
    data: {
      user: publicUser(user),
      token,
    },
  });
};

const serverError = (
  res: any,
  label: string,
  error: unknown
): void => {
  console.error(`${label}:`, error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

/* ───────────── Email helper ───────────── */

const sendPasswordResetEmail = async (
  to: string,
  link: string
): Promise<void> => {
  /*
   * Development mode:
   * If SMTP is not configured, simply print the reset link.
   */
  if (!process.env.SMTP_HOST) {
    console.log(`\n[DEV] Password reset link for ${to}:\n${link}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your Geonev password",
    html: `
      <p>You asked to reset your Geonev password.</p>

      <p>
        <a href="${link}">
          Click here to choose a new password
        </a>
      </p>

      <p>
        This link expires in 30 minutes.
        If you didn't request this, you can safely ignore this email.
      </p>
    `,
  });
};

/* ───────────── WhatsApp OTP helper ───────────── */

const sendWhatsappOtp = async (
  to: string,
  otp: string
): Promise<void> => {
  /*
   * Development mode:
   * Don't call WhatsApp API.
   * Just print the OTP in terminal.
   */
  if (process.env.OTP_DEV_MODE === "true") {
    console.log(`\n[DEV] WhatsApp OTP for +${to}: ${otp}\n`);
    return;
  }

  const {
    WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_TEMPLATE_NAME,
  } = process.env;

  if (
    !WHATSAPP_TOKEN ||
    !WHATSAPP_PHONE_NUMBER_ID ||
    !WHATSAPP_TEMPLATE_NAME
  ) {
    throw new Error("WhatsApp is not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        to,

        type: "template",

        template: {
          name: WHATSAPP_TEMPLATE_NAME,

          language: {
            code: process.env.WHATSAPP_TEMPLATE_LANG || "en",
          },

          components: [
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },

            {
              type: "button",

              sub_type: "url",

              index: "0",

              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    console.error(
      "WhatsApp API error:",
      await response.text()
    );

    throw new Error("Failed to send WhatsApp message");
  }
};

/* ───────────── Email + password ───────────── */

export const register = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const phone = normalizePhone(req.body.phone);

    const emailLower = String(email).toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: emailLower,
          },
          {
            phone,
          },
        ],
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Email or phone number already registered",
      });

      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        phone,
        passwordHash: await hashPassword(password),
        role: toRole(role),
        provider: "LOCAL",
      },
    });

    sendAuth(
      res,
      user,
      "Registration successful",
      201
    );
  } catch (error) {
    serverError(
      res,
      "Register error",
      error
    );
  }
};

export const login = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).toLowerCase(),
      },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: user
          ? "This account uses Google or WhatsApp login. Use that method or reset your password."
          : "Invalid email or password",
      });

      return;
    }

    const passwordMatches = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    sendAuth(
      res,
      user,
      "Login successful"
    );
  } catch (error) {
    serverError(
      res,
      "Login error",
      error
    );
  }
};

/* ───────────── Google login ───────────── */

const googleClient = new OAuth2Client();

export const googleLogin = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const {
      idToken,
      role,
    } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      res.status(500).json({
        success: false,
        message: "Google login not configured",
      });

      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      res.status(401).json({
        success: false,
        message: "Google account not verified",
      });

      return;
    }

    const email = payload.email.toLowerCase();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            googleId: payload.sub,
          },
          {
            email,
          },
        ],
      },
    });

    if (user) {
      if (
        !user.googleId ||
        !user.isVerified
      ) {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            googleId: payload.sub,
            isVerified: true,
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name:
            payload.name ||
            email.split("@")[0],

          email,

          googleId: payload.sub,

          provider: "GOOGLE",

          isVerified: true,

          role: toRole(role),
        },
      });
    }

    sendAuth(
      res,
      user,
      "Google login successful"
    );
  } catch (error) {
    console.error(
      "Google login error:",
      error
    );

    res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
};

/* ───────────── WhatsApp OTP ───────────── */

export const sendOtp = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const phone = normalizePhone(
      req.body.phone
    );

    const recent =
      await prisma.otpRecord.findFirst({
        where: {
          phone,
          purpose: OTP_PURPOSE,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (
      recent &&
      Date.now() -
        recent.createdAt.getTime() <
        OTP_RESEND_MS
    ) {
      res.status(429).json({
        success: false,
        message:
          "Please wait 30 seconds before requesting another OTP",
      });

      return;
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    await prisma.otpRecord.updateMany({
      where: {
        phone,
        purpose: OTP_PURPOSE,
        used: false,
      },

      data: {
        used: true,
      },
    });

    await prisma.otpRecord.create({
      data: {
        phone,

        purpose: OTP_PURPOSE,

        otpHash: hashOtp(
          phone,
          otp
        ),

        expiresAt: new Date(
          Date.now() + OTP_TTL_MS
        ),
      },
    });

    await sendWhatsappOtp(
      phone,
      otp
    );

    res.json({
      success: true,
      message: "OTP sent on WhatsApp",
    });
  } catch (error) {
    serverError(
      res,
      "Send OTP error",
      error
    );
  }
};

export const verifyOtp = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const phone = normalizePhone(
      req.body.phone
    );

    const {
      otp,
      name,
      role,
    } = req.body;

    const record =
      await prisma.otpRecord.findFirst({
        where: {
          phone,

          purpose: OTP_PURPOSE,

          used: false,

          expiresAt: {
            gt: new Date(),
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (
      !record ||
      record.attempts >=
        OTP_MAX_ATTEMPTS
    ) {
      res.status(400).json({
        success: false,
        message:
          "OTP expired or too many attempts. Request a new one.",
      });

      return;
    }

    if (
      record.otpHash !==
      hashOtp(phone, otp)
    ) {
      await prisma.otpRecord.update({
        where: {
          id: record.id,
        },

        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });

      return;
    }

    await prisma.otpRecord.update({
      where: {
        id: record.id,
      },

      data: {
        used: true,
      },
    });

    let user =
      await prisma.user.findUnique({
        where: {
          phone,
        },
      });

    if (user) {
      if (!user.isVerified) {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            isVerified: true,
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name:
            name ||
            `User ${phone.slice(-4)}`,

          phone,

          provider: "WHATSAPP",

          isVerified: true,

          role: toRole(role),
        },
      });
    }

    sendAuth(
      res,
      user,
      "Login successful"
    );
  } catch (error) {
    serverError(
      res,
      "Verify OTP error",
      error
    );
  }
};

/* ───────────── Forgot password ───────────── */

export const forgotPassword = async (
  req: any,
  res: any
): Promise<void> => {
  /*
   * Always return the same response.
   * This prevents attackers from discovering
   * whether an email exists in the database.
   */

  const generic = {
    success: true,
    message:
      "If that email is registered, a reset link has been sent.",
  };

  try {
    const email = String(
      req.body.email
    ).toLowerCase();

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (user) {
      await prisma.passwordResetToken.updateMany(
        {
          where: {
            userId: user.id,
            used: false,
          },

          data: {
            used: true,
          },
        }
      );

      const rawToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      await prisma.passwordResetToken.create({
        data: {
          token: sha256(rawToken),

          userId: user.id,

          expiresAt: new Date(
            Date.now() + RESET_TTL_MS
          ),
        },
      });

      const link =
        `${process.env.FRONTEND_URL}` +
        `/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(
        email,
        link
      );
    }

    res.json(generic);
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    /*
     * Don't reveal whether the email
     * exists even when an internal error occurs.
     */
    res.json(generic);
  }
};

/* ───────────── Reset password ───────────── */

export const resetPassword = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const {
      token,
      password,
    } = req.body;

    const record =
      await prisma.passwordResetToken.findUnique(
        {
          where: {
            token: sha256(token),
          },
        }
      );

    if (
      !record ||
      record.used ||
      record.expiresAt < new Date()
    ) {
      res.status(400).json({
        success: false,
        message:
          "Reset link is invalid or has expired",
      });

      return;
    }

    const passwordHash =
      await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: record.userId,
        },

        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: record.id,
        },

        data: {
          used: true,
        },
      }),
    ]);

    res.json({
      success: true,
      message:
        "Password updated. You can now sign in.",
    });
  } catch (error) {
    serverError(
      res,
      "Reset password error",
      error
    );
  }
};

/* ───────────── Current user ───────────── */

export const me = async (
  req: AuthRequest,
  res: any
): Promise<void> => {
  try {
    const user =
      await prisma.user.findUnique({
        where: {
          id: req.auth!.userId,
        },
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    res.json({
      success: true,
      data: {
        user: publicUser(user),
      },
    });
  } catch (error) {
    serverError(
      res,
      "Me error",
      error
    );
  }
};