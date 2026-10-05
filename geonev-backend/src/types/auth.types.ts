import { UserRole } from "@prisma/client";

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}