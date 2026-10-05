"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Home,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

import { dashboardPathFor, SignupRole, useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import AuthShell from "@/components/AuthShell";
import AuthField from "@/components/AuthField";
import ErrorBox from "@/components/ErrorBox";
import GoogleButton from "@/components/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  // Matches the backend: USER | HOST
  const [role, setRole] = useState<SignupRole>("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (phone.trim().length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      // The backend returns tokens on register, so the user is already signed in
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setError("");
    try {
      // The selected role only applies if this Google account is new
      const user = await loginWithGoogle(idToken, role);
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-up failed"));
    }
  };

  const cardClass = (value: SignupRole, activeClasses: string) =>
    `rounded-xl border-2 p-4 text-left transition-all ${
      role === value
        ? activeClasses
        : "border-slate-200 bg-white hover:border-slate-300"
    }`;

  return (
    <AuthShell
      title="Create an account"
      subtitle="Pick what you want to do"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* Role cards */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("USER")}
          className={cardClass("USER", "border-blue-600 bg-blue-50")}
        >
          <UserIcon
            className={`mb-2 h-5 w-5 ${
              role === "USER" ? "text-blue-600" : "text-slate-400"
            }`}
          />
          <p className="text-sm font-semibold text-slate-900">EV Driver</p>
          <p className="mt-0.5 text-xs text-slate-500">Find &amp; book stations</p>
        </button>

        <button
          type="button"
          onClick={() => setRole("HOST")}
          className={cardClass("HOST", "border-amber-500 bg-amber-50")}
        >
          <Home
            className={`mb-2 h-5 w-5 ${
              role === "HOST" ? "text-amber-500" : "text-slate-400"
            }`}
          />
          <p className="text-sm font-semibold text-slate-900">Station Host</p>
          <p className="mt-0.5 text-xs text-slate-500">List &amp; earn</p>
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <AuthField
          label="Full name"
          icon={UserIcon}
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          label="Phone"
          icon={Phone}
          type="tel"
          autoComplete="tel"
          placeholder="9999999999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <AuthField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <ErrorBox message={error} />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {loading
            ? "Creating account..."
            : `Create ${role === "HOST" ? "Host" : "Driver"} Account`}
        </button>
      </form>

      <GoogleButton onToken={handleGoogle} onError={setError} />

      <p className="mt-4 text-center text-xs text-slate-400">
        By signing up, you agree to our Terms &amp; Privacy Policy.
      </p>
    </AuthShell>
  );
}