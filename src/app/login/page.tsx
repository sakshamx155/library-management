"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { PinInput } from "@/components/ui/PinInput";
import { ShieldCheck, Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<"student" | "admin">("student");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        setCooldown(60); // 60s cooldown for resend
        
        // DEV MODE BYPASS ALERT
        if (data.mockOtp) {
           alert(`[DEV WARNING] No Email API Key Detected.\n\nYour OTP to login is: ${data.mockOtp}\n\nThis is a fallback mechanism so you can continue testing the application!`);
        }
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force router refresh so middleware recognizes cookie immediately
        router.refresh();
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Invalid OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col selection:bg-primary/30">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-6 pb-24 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-plus-lighter pointer-events-none" />

        <div className="w-full max-w-md bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Secure Access</h1>
            <p className="text-muted-foreground text-sm">
              Please strictly adhere to official access policies.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-6">

              {/* Role Toggle */}
              <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === "student" ? "bg-white dark:bg-white/10 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Student/Educator
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === "admin" ? "bg-white dark:bg-white/10 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Administrator
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder={role === "admin" ? "sakshamx155@gmail.com" : "student@example.com"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">We sent a 6-digit code to:</p>
                <p className="font-semibold">{email}</p>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-xs text-primary underline underline-offset-2 mt-2"
                >
                  Wrong email?
                </button>
              </div>

              <div className="space-y-4">
                <PinInput value={otp} onChange={setOtp} length={6} />

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={cooldown > 0 || loading}
                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    {cooldown > 0 ? (
                      <span>Resend code in {cooldown}s</span>
                    ) : (
                      <><RefreshCw className="h-3 w-3" /> Resend Verification Code</>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Sign In"}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
