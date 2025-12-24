"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle"; // Sesuaikan path-nya

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulasi API call recovery
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSent(true);
    } catch (err) {
      setError("Email tidak ditemukan dalam database agen kami.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFBFC] dark:bg-neutral-950 transition-colors duration-300">
      
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-full p-1 border border-gray-100 dark:border-neutral-800">
          <ModeToggle />
        </div>
      </div>

      {/* Left Column: Form Section */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo Brand */}
          <Link href="/login" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 relative flex flex-wrap rotate-45 shrink-0 transition-transform group-hover:scale-110">
              <div className="w-5 h-5 bg-[#F2A93B] rounded-tl-sm"></div>
              <div className="w-5 h-5 bg-[#4A90E2] rounded-tr-sm"></div>
              <div className="w-5 h-5 bg-[#8E8E8E] rounded-bl-sm"></div>
              <div className="w-5 h-5 bg-[#7ED321] rounded-br-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-[#4A90E2] dark:text-white leading-none uppercase">
                Affiliate<span className="text-[#F2A93B]">Core</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8E8E8E]">Portal System</span>
            </div>
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isSent ? "Check Your Inbox" : "Reset Access"}
            </h1>
            <p className="text-[#8E8E8E] text-sm">
              {isSent 
                ? "Kami telah mengirimkan instruksi pemulihan ke email Anda." 
                : "Masukkan email terdaftar Anda untuk memulihkan akses dashboard."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-50 dark:border-neutral-800 space-y-5">
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Registered Email</Label>
                  <Input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-circle-notch animate-spin"></i> Processing...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>

              {/* Support Alternative */}
              <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/20 text-center">
                <p className="text-xs text-[#8E8E8E] mb-2 font-medium">Masalah dengan email Anda?</p>
                <a 
                  href="https://wa.me/6282261936478?text=Halo%20Admin%2C%20saya%20lupa%20akses%20akun%20AffiliateCore%20saya." 
                  target="_blank"
                  className="text-xs font-black text-[#F2A93B] hover:underline flex items-center justify-center gap-2"
                >
                  <i className="fab fa-whatsapp text-lg"></i> HUBUNGI WHATSAPP SUPPORT
                </a>
              </div>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm font-bold text-[#8E8E8E] hover:text-[#4A90E2] transition-colors">
                  <i className="fas fa-arrow-left mr-2"></i> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-900 p-10 rounded-[2rem] shadow-xl border border-gray-50 dark:border-neutral-800 text-center space-y-4">
                <div className="w-20 h-20 bg-[#7ED321]/10 text-[#7ED321] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <h3 className="font-black text-xl text-neutral-900 dark:text-white uppercase tracking-tighter">Instructions Sent!</h3>
                <p className="text-sm text-[#8E8E8E] leading-relaxed">
                  Kami telah mengirim tautan pemulihan ke <span className="text-[#4A90E2] font-bold">{email}</span>. Tautan berlaku selama 30 menit.
                </p>
                <Button 
                  onClick={() => setIsSent(false)} 
                  variant="outline" 
                  className="w-full rounded-xl border-gray-200 dark:border-neutral-800 text-[#8E8E8E] font-bold"
                >
                  Tidak menerima email? Coba lagi
                </Button>
              </div>
              
              <div className="text-center">
                <Link href="/login" className="bg-[#4A90E2] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 inline-block">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Visual Experience (Consistent with Login) */}
      <div className="hidden lg:flex bg-[#4A90E2] dark:bg-neutral-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#F2A93B] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#7ED321] opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl space-y-8">
            <div className="aspect-square relative rounded-[2rem] overflow-hidden border-4 border-white/30">
              {/* Gunakan gambar yang mencerminkan keamanan/security */}
              <Image
                src="/image-security.jpg" 
                alt="Secure Access"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-white space-y-4">
              <div className="flex gap-2">
                <span className="bg-[#F2A93B] text-[10px] font-black px-3 py-1 rounded-full uppercase">Security V2.0</span>
                <span className="bg-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase">Masked Identity</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tighter">
                Secure Your <br />
                <span className="text-[#7ED321]">Account Assets.</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Jangan khawatir, aset digital dan histori trafik Anda tetap aman. Pulihkan akses Anda melalui sistem verifikasi kami yang berlapis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}