"use client";

import { useEffect, useState } from "react";

export default function ApiPage() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch("http://localhost:7000/");

        const data = await response.text();

        setMessage(data);
      } catch (error) {
        console.error(error);

        setMessage("Backend connection failed");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        API Connection Test
      </h1>

      <p>{message}</p>
    </div>
  );
}