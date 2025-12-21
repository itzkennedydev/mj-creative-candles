"use client";

import Image from "next/image";
import { useState } from "react";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/coming-soon/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thanks! We'll notify you when we launch.");
        setEmail("");
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4 max-w-lg mx-auto">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo/MJLogo_optimized.png"
            alt="MJ Creative Candles Logo"
            width={300}
            height={300}
            priority
            className="w-auto h-auto max-w-[300px]"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          We're working on something special. Stay tuned!
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
          <p className="text-sm text-gray-600 mb-4">
            Get notified when we launch
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-xl bg-white placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1d1d1f] text-white text-sm font-medium rounded-xl hover:bg-[#0a0a0a] transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Subscribing..." : "Notify Me"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-green-600 font-medium">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
