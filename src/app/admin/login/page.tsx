"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const greetingMessages = [
  "Have a stitch please ish day today",
  "Make it a stitch please kind of day",
  "Stitch please vibes only",
  "Today's the day to stitch please",
  "Keep it stitch please",
  "Spread some stitch please energy",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [currentGreeting, setCurrentGreeting] = useState<string>(greetingMessages[0] ?? "Have a stitch please ish day today");

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
      const selectedGreeting: string = greetingMessages[randomIndex] ?? greetingMessages[0] ?? "Have a stitch please ish day today";
      
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
        setError(data.message || data.error || "Failed to send verification code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="mb-16">
            <Image 
              src="/Stitch Please Ish Black.png" 
              alt="Stitch Please Logo" 
              width={360}
              height={120}
              className="h-32 w-auto mb-16"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-black">
            {step === "code" ? "Enter verification code" : "Sign in to your account"}
          </h1>
          <p className="text-gray-600 mb-8">
            {step === "code" 
              ? "Enter the verification code sent to your email" 
              : "Welcome back! Please enter your details."}
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4" suppressHydrationWarning>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={loading || !email}
              >
                {loading ? "Processing..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4" suppressHydrationWarning>
              <div>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black text-center text-2xl tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={loading}
                  suppressHydrationWarning
                />
                <p className="text-sm text-gray-600 mt-2">
                  Code sent to {email}
                </p>
                {countdown > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-950 p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden md:block md:w-1/2 p-4">
        <div className="h-full rounded-lg overflow-hidden relative">
          <Image
            src="/_DSC0250.jpg"
            alt="Stitch Please"
            fill
            className="object-cover rounded-lg"
            priority
            sizes="50vw"
          />
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent via-30% to-transparent rounded-lg pointer-events-none" />

          {/* Greeting message at bottom left */}
          <div className="absolute bottom-8 left-8 z-10 pointer-events-none">
            <p className="text-white text-2xl md:text-3xl font-medium leading-tight transition-opacity duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
              {currentGreeting?.split(/(stitch please[^\s]*)/i).map((part, index) => 
                /stitch please/i.test(part) ? (
                  <span key={index} className="font-bold">{part}</span>
                ) : (
                  part
                )
              ) ?? "Have a stitch please ish day today"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

