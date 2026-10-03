"use client";

import Link from "next/link";

import {
  useState,
  useMemo,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Zap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Plus,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();

  const router = useRouter();

  const {
    user,
    logout,
    loading,
  } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  // Role
  const isOwner =
    user?.role === "OWNER";

  // Avatar initials
  const initials =
    user?.email
      ?.charAt(0)
      .toUpperCase() || "U";

  // Display name
  const displayName =
    user?.email?.split("@")[0] ||
    "User";

  // Navigation links
  const navLinks = useMemo(
    () => [
      {
        name: "Stations",
        href: "/stations",
      },

      {
        name: "How it works",
        href: "/how-it-works",
      },

      isOwner
        ? {
            name: "Add Station",
            href: "/owner/create-listing",
          }
        : {
            name: "Become Host",
            href: "/become-host",
          },

      {
        name: "About",
        href: "/about",
      },
    ],
    [isOwner],
  );

  // Dashboard route
  const dashboardHref = isOwner
    ? "/owner/dashboard"
    : "/user/dashboard";

  // Profile route
  const profileHref = isOwner
    ? "/owner/profile"
    : "/user/profile";

  // Logout
  const handleLogout = async () => {
    await logout();

    setDropdownOpen(false);

    router.push("/");
  };

  // IMPORTANT:
  // Loading check MUST come after hooks
  if (loading) return null;

  return (
    <header className="fixed left-0 top-4 z-50 w-full">
      <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between rounded-full border border-white/30 bg-white/60 px-6 py-3 shadow-[0_8px_32px_rgba(31,38,135,0.15)] backdrop-blur-2xl">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066FF] transition-all duration-300 group-hover:scale-105">
            <Zap
              className="h-5 w-5 text-white"
              fill="currentColor"
            />
          </div>

          <span className="text-lg font-bold tracking-tight text-gray-900">
            Geo
            <span className="text-[#FFB800]">
              NEV
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href;

            const isAddStation =
              link.name ===
              "Add Station";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/80 text-[#0066FF] shadow-sm"
                    : isAddStation
                    ? "bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20"
                    : "text-gray-700 hover:bg-white/60 hover:text-gray-900"
                }`}
              >
                {isAddStation && (
                  <Plus className="h-4 w-4" />
                )}

                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Not logged in */}
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-black"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:bg-[#0052CC]"
              >
                Get started
              </Link>
            </>
          ) : (
            // Logged in
            <div className="relative">
              <button
                onClick={() =>
                  setDropdownOpen(
                    !dropdownOpen,
                  )
                }
                className="flex items-center gap-3 rounded-full border border-white/40 bg-white/60 px-2 py-1.5 backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-sm"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-sm font-semibold text-white shadow-inner">
                    {initials}
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  </span>
                </div>

                <div className="hidden flex-col items-start pr-1 lg:flex">
                  <span className="text-sm font-medium leading-tight text-gray-900">
                    {displayName}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-medium leading-tight text-gray-500">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        isOwner
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />

                    {user.role}
                  </span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    dropdownOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/30 bg-white/85 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-base font-semibold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() =>
                      setDropdownOpen(false)
                    }
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-white/60"
                  >
                    <LayoutDashboard className="h-4 w-4" />

                    Dashboard
                  </Link>

                  {isOwner && (
                    <Link
                      href="/owner/create-listing"
                      onClick={() =>
                        setDropdownOpen(
                          false,
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-white/60"
                    >
                      <Plus className="h-4 w-4" />

                      Add Station
                    </Link>
                  )}

                  <Link
                    href={profileHref}
                    onClick={() =>
                      setDropdownOpen(false)
                    }
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-white/60"
                  >
                    <User className="h-4 w-4" />

                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />

                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-sm font-semibold text-white">
                {initials}
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
          )}

          <button
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/50"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}