"use client";

import { useAuth } from "@/context/AuthContext";

export default function HostDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Host Dashboard
      </h1>

    </div>
  );
}