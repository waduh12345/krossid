"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  Users,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { useRegisterMutation } from "@/services/auth.service";
import type { RegisterPayload } from "@/types/user";

// Pastikan file error-handle.ts ada atau sesuaikan path import interface ini
export interface ApiErrorResponse {
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
  message?: string;
  status?: number | string;
}

const registerBenefits = [
  {
    id: 1,
    title: "Join the Elite\nAffiliate Network.",
    quote:
      "Dapatkan akses ke produk digital eksklusif dan mulai bangun passive income Anda hari ini.",
    tag: "Network Advantage",
  },
  {
    id: 2,
    title: "Scale your\nBusiness Assets.",
    quote:
      "Kelola agen, pantau performa real-time, dan distribusikan program Anda secara masif.",
    tag: "Owner Power",
  },
];

const RegisterPage = () => {
  const router = useRouter();

  // Hooks API (Hanya Register di sini)
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [role, setRole] = useState<'owner' | 'sales' | 'user'>('user'); // 2: Affiliator, 3: Owner

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: role,
  });

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % registerBenefits.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex(
      (prev) => (prev - 1 + registerBenefits.length) % registerBenefits.length
    );
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  // --- HANDLER REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Konfirmasi password tidak cocok.",
        background: "#fff",
        confirmButtonColor: "#d33",
      });
    }

    try {
      const payload: RegisterPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: role,
        // Jika role === 3 (Owner), maka sales = true.
        // sales: role === 'sales' ? true : false,
        sales: false,
      };

      const response = await register(payload).unwrap();

      // SIMPAN TOKEN KE SESSION STORAGE
      // Pastikan backend mengembalikan structure { data: { token: '...' } }
      if (response.data && response.data.token) {
        sessionStorage.setItem("temp_reg_token", response.data.token);
      }

      Swal.fire({
        icon: "success",
        title: "Registration Success",
        text: "Silakan verifikasi email Anda.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/verify-email");
      });
    } catch (err) {
      const error = err as ApiErrorResponse;
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.data?.message ||
          error.message ||
          "Terjadi kesalahan saat mendaftar.",
      });
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
      <div className="relative z-10 w-full max-w-6xl bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-2xl flex flex-col md:flex-row p-6 m-4">
        {/* Left Section: Form Register */}
        <div className="flex-[1.2] p-8 lg:p-12 text-white overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="mb-8">
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
                  Create Account
                </h1>
                <p className="text-white/70 text-sm italic">
                  Join our professional network today.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/50 ml-4 tracking-widest">
                  Full Name (can be changed later)
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/50 ml-4 tracking-widest">
                  Email (Verification OTP)
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/50 ml-4 tracking-widest">
                  Nomor Handphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="0812xxxx"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/50 ml-4 tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/50 ml-4 tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegisterLoading}
              className={`w-full py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all mt-6 text-white ${
                role === 'owner' ? "bg-[#DF9B35]" : "bg-[#367CC0]"
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isRegisterLoading ? "Processing..." : "Register Now"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              Already a member?{" "}
              <Link
                href="/signin"
                className="text-white font-bold underline underline-offset-4 hover:text-[#DF9B35] transition-colors"
              >
                Sign In Securely
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section: Black Card (Visuals) */}
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

export default RegisterPage;