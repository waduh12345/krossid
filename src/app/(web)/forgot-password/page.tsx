"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// Import Service
import { useForgotPasswordMutation } from "@/services/auth.service";
import { ApiErrorResponse } from "@/lib/error-handle"; // Pastikan path sesuai

// Konten edukasi keamanan untuk sisi kanan
const securitySteps = [
  {
    id: 1,
    title: "Protect your\nAccount Access.",
    quote:
      "Gunakan autentikasi dua faktor dan jangan pernah membagikan kode OTP Anda kepada siapapun.",
    tag: "Security Tip",
  },
  {
    id: 2,
    title: "Encrypted\nData Recovery.",
    quote:
      "Proses pemulihan akun kami menggunakan enkripsi end-to-end untuk memastikan data Anda tetap aman.",
    tag: "Privacy First",
  },
];

const ForgotPasswordPage = () => {
  const router = useRouter();

  // Hooks API
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState("");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % securitySteps.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex(
      (prev) => (prev - 1 + securitySteps.length) % securitySteps.length
    );
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword({ email }).unwrap();

      // Simpan email ke session untuk langkah selanjutnya
      sessionStorage.setItem("reset_email", email);

      setIsSubmitted(true);
      Swal.fire({
        icon: "success",
        title: "Link Sent!",
        text: "Kode OTP telah dikirim ke email Anda.",
        confirmButtonColor: "#367CC0",
      }).then(() => {
        // Redirect ke halaman verifikasi OTP
        router.push("/verify-reset");
      });
    } catch (err) {
      const error = err as ApiErrorResponse;
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text:
          error.data?.message || "Gagal mengirim permintaan reset password.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#367CC0] relative overflow-hidden font-sans p-4">
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
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-2xl flex flex-col md:flex-row p-6 m-4">
        {/* Left Section: Forgot Password Form */}
        <div className="flex-1 p-8 lg:p-12 text-white">
          <div className="mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-10 border border-white/10">
              <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#DF9B35] rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-white/70 text-sm italic">
              {isSubmitted
                ? "Please check your inbox for instructions."
                : "No worries, we'll send you reset instructions."}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleResetRequest} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Reset Password"}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <div className="text-center p-8 bg-white/5 rounded-[32px] border border-white/10 animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-[#DF9B35] mx-auto mb-4" />
              <p className="text-white font-medium">
                Link pemulihan telah dikirim!
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-6 text-sm text-white/60 hover:text-white underline"
              >
                Resend Link
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/signin"
              className="flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to{" "}
              <span className="font-bold underline underline-offset-4">
                Sign In
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section: Black Card with SMOOTH CONCAVE NOTCH */}
        <div className="flex-1 relative hidden md:block">
          <div
            className="h-full w-full bg-[#0a0a0a] rounded-[40px] p-12 flex flex-col relative overflow-hidden shadow-inner"
            style={{
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
                    {securitySteps[index].title}
                  </h2>
                  <div className="text-5xl text-[#DF9B35] leading-none italic font-serif opacity-80">
                    “
                  </div>
                  <p className="text-white/60 text-lg leading-relaxed max-w-xs italic font-light">
                    {`${securitySteps[index].quote}`}
                  </p>

                  <div>
                    <h4 className="text-white text-xl font-bold">
                      {securitySteps[index].tag}
                    </h4>
                    <p className="text-[#367CC0] text-sm mt-1 font-bold uppercase tracking-widest">
                      Security verified
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={prevSlide}
                      className="w-12 h-10 bg-[#DF9B35] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-12 h-10 bg-[#367CC0] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Background Graphic (Key/Starburst) */}
            <div className="absolute right-[-20px] bottom-10 opacity-20 pointer-events-none">
              <KeyRound className="w-64 h-64 text-[#367CC0] rotate-12" />
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
            <div className="flex items-center gap-2 mb-3 text-[#7ED321]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Account Protection
              </span>
            </div>
            <h5 className="font-black text-gray-900 text-sm leading-snug mb-3 uppercase tracking-tighter">
              Always verify your identity securely
            </h5>
            <div className="flex items-center -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  src={`https://i.pravatar.cc/150?u=sec${i + 90}`}
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

export default ForgotPasswordPage;