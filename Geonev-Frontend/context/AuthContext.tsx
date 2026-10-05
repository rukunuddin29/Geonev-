"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, tokenStore } from "@/lib/api";

export type Role = "USER" | "HOST";
export type SignupRole = Role;

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  provider: "LOCAL" | "GOOGLE" | "WHATSAPP";
  isVerified: boolean;
}

export const isHostRole = (role?: Role) => role === "HOST";
export const dashboardPathFor = (role: Role) =>
  role === "HOST" ? "/host/dashboard" : "/dashboard";

interface AuthResponse {
  data: { user: AuthUser; token: string };
}

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: SignupRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string, role?: SignupRole) => Promise<AuthUser>;
  sendWhatsappOtp: (phone: string) => Promise<void>;
  verifyWhatsappOtp: (
    phone: string,
    otp: string,
    role?: SignupRole
  ) => Promise<AuthUser>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const restore = async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const res = await api<{ data: { user: AuthUser } }>("/auth/me", {
          auth: true,
        });
        setUser(res.data.user);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const finish = (res: AuthResponse) => {
    tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) =>
      finish(await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } })),
    register: async (input) =>
      finish(await api<AuthResponse>("/auth/register", { method: "POST", body: input })),
    loginWithGoogle: async (idToken, role) =>
      finish(await api<AuthResponse>("/auth/google", { method: "POST", body: { idToken, role } })),
    sendWhatsappOtp: async (phone) => {
      await api("/auth/whatsapp/send-otp", { method: "POST", body: { phone } });
    },
    verifyWhatsappOtp: async (phone, otp, role) =>
      finish(
        await api<AuthResponse>("/auth/whatsapp/verify-otp", {
          method: "POST",
          body: { phone, otp, role },
        })
      ),
    forgotPassword: async (email) =>
      (await api<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } })).message,
    resetPassword: async (token, password) =>
      (await api<{ message: string }>("/auth/reset-password", { method: "POST", body: { token, password } })).message,
    logout: () => {
      tokenStore.clear();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}