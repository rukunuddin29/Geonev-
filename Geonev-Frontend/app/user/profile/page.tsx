
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="px-6 pt-36 text-white/50">Loading...</div>;
  }

  const rows: [string, string][] = [
    ["Name", user.name],
    ["Email", user.email ?? "—"],
    ["Phone", user.phone ?? "—"],
    ["Role", user.role],
    ["Status", "Active"],
  ];

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-32">
      <h1 className="mb-6 text-3xl font-bold">Your profile</h1>

      <div className="rounded-2xl border border-white/10 bg-[#141c2e] p-6">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([key, val]) => (
              <tr
                key={key}
                className="border-b border-white/10 last:border-0"
              >
                <td className="py-3 text-white/40">{key}</td>
                <td className="py-3 text-right font-medium">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}