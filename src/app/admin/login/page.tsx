"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const greetingMessages = [
  "Light up your day with MJ Creative Candles",
  "Where creativity meets candlelight",
  "Handcrafted candles for every moment",
  "Illuminate your space with artisan candles",
  "Crafted with love, lit with passion",
  "Create ambiance, spark joy",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState<string>(
    greetingMessages[0] ?? "Light up your day with MJ Creative Candles",
  );

  useEffect(() => {
    // Check if already authenticated
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  useEffect(() => {
    // Get today's date string
    const today = new Date().toDateString();

    // Check if we have a stored date and greeting
    const storedDate = localStorage.getItem("greetingDate");
    const storedGreeting = localStorage.getItem("greetingMessage");

    // If it's a new day or no stored greeting, pick a new one
    if (storedDate !== today || !storedGreeting) {
      // Pick a random greeting for today
      const randomIndex = Math.floor(Math.random() * greetingMessages.length);
      const selectedGreeting: string =
        greetingMessages[randomIndex] ??
        greetingMessages[0] ??
        "Light up your day with MJ Creative Candles";

      // Store today's date and selected greeting
      localStorage.setItem("greetingDate", today);
      localStorage.setItem("greetingMessage", selectedGreeting);
      setCurrentGreeting(selectedGreeting);
    } else {
      // Use the stored greeting for today
      setCurrentGreeting(storedGreeting);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("code");
        setCountdown(600); // 10 minutes
      } else {
        setError(
          data.message || data.error || "Failed to send verification code",
        );
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and email
        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("adminEmail", email);
        if (data.refreshToken) {
          sessionStorage.setItem("adminRefreshToken", data.refreshToken);
        }
        // Redirect to dashboard
        router.push("/admin");
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - Login Form */}
      <div className="flex w-full items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-16 flex justify-start">
            <div className="relative" style={{ height: "80px" }}>
              <Image
                src="/images/logo/MJLogo_optimized.png"
                alt="MJ Creative Candles Logo"
                width={320}
                height={80}
                className="object-contain"
                style={{ width: "auto", height: "80px" }}
                priority
              />
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-black">
            {step === "code"
              ? "Enter verification code"
              : "Sign in to your account"}
          </h1>
          <p className="mb-8 text-gray-600">
            {step === "code"
              ? "Enter the verification code sent to your email"
              : "Welcome back! Please enter your details."}
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form
              onSubmit={handleSendCode}
              className="space-y-4"
              suppressHydrationWarning
            >
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1d1d1f] p-3 font-semibold text-white transition-colors duration-200 hover:bg-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyCode}
              className="space-y-4"
              suppressHydrationWarning
            >
              <div>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-2xl tracking-normal text-black focus:border-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                  disabled={loading}
                  suppressHydrationWarning
                />
                <p className="mt-2 text-sm text-gray-600">
                  Code sent to {email}
                </p>
                {countdown > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Code expires in {formatTime(countdown)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="flex-1 rounded-lg bg-gray-100 p-3 font-medium text-gray-950 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1d1d1f] p-3 font-semibold text-white transition-colors duration-200 hover:bg-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden p-4 md:block md:w-1/2">
        <div className="relative h-full overflow-hidden rounded-lg">
          <Image
            src="/images/hero/hero.jpg"
            alt="MJ Creative Candles"
            fill
            className="rounded-lg object-cover"
            priority
            sizes="50vw"
          />
          {/* Overlay gradient for better text readability */}
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-black/90 via-transparent via-30% to-transparent" />

          {/* Greeting message at bottom left */}
          <div className="pointer-events-none absolute bottom-8 left-8 z-10">
            <p className="text-2xl font-medium leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-opacity duration-500 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] md:text-3xl">
              {currentGreeting}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
