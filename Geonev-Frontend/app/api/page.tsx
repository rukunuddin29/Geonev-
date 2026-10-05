"use client";

import { useEffect, useState } from "react";

export default function ApiPage() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/v1$/, "") ??
      "http://localhost:5000/api";

    fetch(`${base}/health`)
      .then((r) => r.json())
      .then((d) => setMessage(d.message))
      .catch(() => setMessage("Backend connection failed"));
  }, []);

  return (
    <div className="p-10 pt-32">
      <h1 className="mb-5 text-3xl font-bold">API Connection Test</h1>
      <p>{message}</p>
    </div>
  );
}