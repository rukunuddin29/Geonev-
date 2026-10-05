"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, Phone, KeyRound } from "lucide-react";

import { dashboardPathFor, useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import AuthShell from "@/components/AuthShell";
import AuthField from "@/components/AuthField";
import ErrorBox from "@/components/ErrorBox";
import GoogleButton from "@/components/GoogleButton";

type Mode = "email" | "whatsapp";

const btnClass =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, sendWhatsappOtp, verifyWhatsappOtp } =
    useAuth();

  const [mode, setMode] = useState<Mode>("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // whatsapp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      await sendWhatsappOtp(phone);
      setOtpSent(true);
      setOtp("");
      setCooldown(30);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const user = await verifyWhatsappOtp(phone, otp);
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(getErrorMessage(err, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setError("");
    try {
      const user = await loginWithGoogle(idToken);
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(getErrorMessage(err, "Google login failed"));
    }
  };

  const tabClass = (m: Mode) =>
    `flex-1 rounded-md py-2 text-sm font-semibold transition ${
      mode === m
        ? "bg-white text-blue-600 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
    }`;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create one
          </Link>
        </>
      }
    >
      {/* Method switcher */}
      <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
        <button type="button" onClick={() => switchMode("email")} className={tabClass("email")}>
          Email
        </button>
        <button type="button" onClick={() => switchMode("whatsapp")} className={tabClass("whatsapp")}>
          WhatsApp
        </button>
      </div>

      {mode === "email" && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <AuthField
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthField
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <ErrorBox message={error} />

          <button type="submit" disabled={loading} className={btnClass}>
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      {mode === "whatsapp" && !otpSent && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <AuthField
            label="WhatsApp number"
            icon={Phone}
            type="tel"
            autoComplete="tel"
            placeholder="9999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            We&apos;ll send a 6-digit code to this number on WhatsApp. New
            numbers get an EV Driver account automatically.
          </p>

          <ErrorBox message={error} />

          <button type="submit" disabled={loading} className={btnClass}>
            <Phone className="h-4 w-4" />
            {loading ? "Sending..." : "Send OTP on WhatsApp"}
          </button>
        </form>
      )}

      {mode === "whatsapp" && otpSent && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter the code sent to <span className="font-semibold">{phone}</span>
          </p>

          <AuthField
            label="OTP"
            icon={KeyRound}
            type="text"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />

          <ErrorBox message={error} />

          <button type="submit" disabled={loading} className={btnClass}>
            <LogIn className="h-4 w-4" />
            {loading ? "Verifying..." : "Verify & sign in"}
          </button>

          <div className="flex justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setError("");
              }}
              className="font-semibold text-slate-500 hover:text-slate-700"
            >
              Change number
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={() => handleSendOtp()}
              className="font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      <GoogleButton onToken={handleGoogle} onError={setError} />
    </AuthShell>
  );
}