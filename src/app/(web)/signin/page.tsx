"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
// Import tambahan untuk fungsionalitas login
import { signIn } from "next-auth/react";
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
        router.push("/home");
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
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-10 border border-white/10">
              <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#DF9B35] rounded-full"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
            <p className="text-white/70 text-sm italic">
              Please Enter your Account details
            </p>
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
            className="h-full w-full bg-[#0a0a0a] rounded-[40px] p-12 flex flex-col relative overflow-hidden shadow-inner"
            style={{
              maskImage:
                "radial-gradient(circle 45px at calc(100% - 10px) 10px, transparent 100%, black 101%)",
              WebkitMaskImage:
                "radial-gradient(circle 55px at 100% 0%, transparent 100%, black 101%)",
            }}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-8"
                >
                  <h2 className="text-[40px] font-bold text-white leading-tight whitespace-pre-line tracking-tight">
                    {testimonials[index].title}
                  </h2>
                  <div className="text-5xl text-[#DF9B35] leading-none italic font-serif opacity-80">
                    “
                  </div>
                  <p className="text-white/60 text-lg leading-relaxed max-w-xs italic font-light">
                    {testimonials[index].quote}
                  </p>

                  <div>
                    <h4 className="text-white text-xl font-bold">
                      {testimonials[index].name}
                    </h4>
                    <p className="text-[#367CC0] text-sm mt-1 font-bold uppercase tracking-widest">
                      {testimonials[index].role}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={prevTestimonial}
                      className="w-12 h-10 bg-[#DF9B35] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="w-12 h-10 bg-[#367CC0] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Background Starburst */}
            <div className="absolute right-[-30px] bottom-10 opacity-20 pointer-events-none">
              <svg width="300" height="300" viewBox="0 0 200 200" fill="none">
                {[...Array(16)].map((_, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={100 + 100 * Math.cos((i * 22.5 * Math.PI) / 180)}
                    y2={100 + 100 * Math.sin((i * 22.5 * Math.PI) / 180)}
                    stroke="#367CC0"
                    strokeWidth="0.8"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Floating White Card with SMOOTH CONCAVE NOTCH */}
          <div
            className="absolute -bottom-8 -right-4 w-[300px] bg-white p-8 pt-12 rounded-[32px] shadow-2xl z-20 border border-gray-100"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle 50px at 100% 0%, transparent 100%, black 101%)",
            }}
          >
            <h5 className="font-black text-gray-900 text-sm leading-snug mb-3 uppercase tracking-tighter">
              Get your right job and right place apply now
            </h5>
            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed font-medium">
              Be among the first founders to experience the easiest way to start
              run a business.
            </p>
            <div className="flex items-center -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  src={`https://i.pravatar.cc/150?u=${i + 60}`}
                  alt="user"
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-[#367CC0] text-white text-[9px] flex items-center justify-center border-2 border-white font-black shadow-sm">
                +2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
