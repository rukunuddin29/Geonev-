import { z } from "zod";
const role = z.enum(["USER", "HOST"]).optional();
export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role,
});
export const loginSchema = z.object({
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});
export const googleSchema = z.object({
    idToken: z.string().min(10, "Google token missing"),
    role,
});
export const sendOtpSchema = z.object({
    phone: z.string().trim().min(10, "Enter a valid phone number"),
});
export const verifyOtpSchema = z.object({
    phone: z.string().trim().min(10, "Enter a valid phone number"),
    otp: z.string().trim().length(6, "OTP must be 6 digits"),
    name: z.string().trim().min(2).optional(),
    role,
});
export const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Enter a valid email"),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(10, "Reset token missing"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
