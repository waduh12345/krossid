"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
// Import tambahan untuk fungsionalitas login
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    id: 1,
    title: "What's our\nJobseekers Said.",
    quote:
      "Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.",
    name: "Mas Parjono",
    role: "UI Designer at Google",
  },
  {
    id: 2,
    title: "Success Stories\nFrom Founders.",
    quote:
      "Platform ini membantu saya menemukan talenta terbaik di bidang teknologi hanya dalam hitungan hari.",
    name: "Siska Amelia",
    role: "CTO at Startup.io",
  },
];

const LoginPage = () => {
  // State untuk animasi (bawaan lama)
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // State baru untuk Logic Login
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const nextTestimonial = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  // Handler Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        // Wait for session to update, then get session to check role
        // Retry mechanism to ensure session is loaded
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSessionAndRedirect = async () => {
          const session = await getSession();
          
          // Check if session and roles are available
          if (session?.user?.roles && Array.isArray(session.user.roles) && session.user.roles.length > 0) {
            // Get first role name
            const firstRole = session.user.roles[0];
            const userRole = typeof firstRole === "object" && "name" in firstRole 
              ? firstRole.name 
              : typeof firstRole === "string" 
              ? firstRole 
              : null;

            // Redirect based on role
            if (userRole === "superadmin" || userRole === "owner") {
              router.push("/cms");
            } else {
              router.push("/home");
            }
          } else if (attempts < maxAttempts) {
            // Retry if session not ready yet
            attempts++;
            setTimeout(checkSessionAndRedirect, 200);
          } else {
            // Fallback to /home if session not available after max attempts
            router.push("/home");
          }
        };

        // Start checking session
        setTimeout(checkSessionAndRedirect, 100);
      } else {
        setError("Email atau password salah.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#367CC0] relative overflow-hidden font-sans">
      {/* Background Gradient & Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0] via-[#5da2e6] to-[#DF9B35] opacity-90"></div>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 flex flex-col md:flex-row p-6 m-4 shadow-2xl">
        {/* Left Section: Login Form */}
        <div className="flex-1 p-8 lg:p-12 text-white">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-12 h-12 border-2 border-white rounded-sm flex items-center justify-center">
                  <img
                    src="/kross-id.png"
                    alt="Kross.id Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-white/70 text-sm italic">
                  Please Enter your Account details
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                placeholder="Johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-8 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-8 text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-[13px] px-2">
              <label className="flex items-center gap-2 cursor-pointer text-white/70">
                <input
                  type="checkbox"
                  className="rounded bg-black/40 border-white/10 text-[#367CC0]"
                />
                <span>Keep me logged in</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-white/70 hover:text-[#DF9B35] transition-colors underline underline-offset-4 font-medium"
              >
                Forgot Password
              </Link>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] disabled:bg-[#DF9B35]/70 disabled:cursor-not-allowed rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Social Icons */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-300">
              {`Don't have an account?`}
              <Link
                href="/signup"
                className="text-white font-bold underline underline-offset-4"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section: Black Card with SMOOTH CONCAVE NOTCH */}
        <div className="flex-1 relative hidden md:block">
          <div
            className="h-full w-full bg-transparent rounded-[40px] overflow-hidden relative shadow-inner"
            style={{
              maskImage:
          "radial-gradient(circle 45px at calc(100% - 10px) 10px, transparent 100%, black 101%)",
              WebkitMaskImage:
          "radial-gradient(circle 55px at 100% 0%, transparent 100%, black 101%)",
            }}
          >
            {/* Hero Image */}
            <img
              src="/hero-login.webp"
              alt="Hero Login"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient (optional, untuk memberikan efek gelap) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
