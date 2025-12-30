"use client";

import * as React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { useRegisterMutation } from "@/services/auth.service";
import Swal from "sweetalert2";
import { Building2, Users, CheckCircle2 } from "lucide-react"; // Ikon tambahan

interface responseError {
  data?: {
    message?: string;
  };
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>(""); 
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<number>(4); // Default Affiliate (2)
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 13) setPhone(value);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.ok) router.push("/");
      else setError("Email atau password salah.");
    } catch {
      setError("Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (!name.trim() || name.length < 3) return setError("Nama lengkap minimal 3 karakter.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Format email tidak valid.");
    if (phone.length < 9 || phone.length > 13) return setError("Nomor HP harus 9-13 digit.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== passwordConfirmation) return setError("Konfirmasi password tidak cocok.");

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: `+62${phone}`,
        password,
        password_confirmation: passwordConfirmation,
        role_id: selectedRoleId, // Menggunakan role yang dipilih (2 atau 3)
      };

      await registerMutation(payload).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil",
        text: `Selamat bergabung sebagai ${selectedRoleId === 3 ? 'Owner' : 'Affiliate'}!`,
        timer: 2000,
        showConfirmButton: false,
      });

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: payload.email,
        password: payload.password,
      });

      if (signInRes?.ok) router.push("/");
      else {
        setMode("login");
        setError("Silakan login dengan akun baru Anda.");
      }
    } catch (err: unknown) {
      const error = err as responseError;
      setError(error?.data?.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFBFC] dark:bg-neutral-950 transition-colors duration-300">
      
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-full p-1 border border-gray-100 dark:border-neutral-800">
          <ModeToggle />
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 relative flex flex-wrap rotate-45 shrink-0">
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
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {mode === "login" ? "Welcome Back" : "Join the Network"}
            </h1>
            <p className="text-[#8E8E8E] text-sm italic">
              {mode === "login"
                ? "Manage your social capital and track your earnings."
                : "Choose your role and start your journey with us."}
            </p>
          </div>

          <form onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-5">
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-50 dark:border-neutral-800 space-y-5">
              
              {/* Role Selection (Hanya muncul saat Register) */}
              {mode === "register" && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Select Your Account Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Option Affiliate */}
                    <div 
                      onClick={() => setSelectedRoleId(4)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedRoleId === 4
                        ? "border-[#4A90E2] bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-[#4A90E2]" 
                        : "border-gray-100 dark:border-neutral-800 hover:border-gray-200"
                      }`}
                    >
                      {selectedRoleId === 4 && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#4A90E2]" />}
                      <Users className={`w-6 h-6 mb-2 ${selectedRoleId === 4 ? "text-[#4A90E2]" : "text-gray-400"}`} />
                      <span className={`text-xs font-bold uppercase tracking-tighter ${selectedRoleId === 4 ? "text-[#4A90E2]" : "text-gray-500"}`}>Affiliate</span>
                    </div>

                    {/* Option Owner */}
                    <div 
                      onClick={() => setSelectedRoleId(3)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedRoleId === 3 
                        ? "border-[#F2A93B] bg-orange-50/50 dark:bg-orange-900/10 ring-1 ring-[#F2A93B]" 
                        : "border-gray-100 dark:border-neutral-800 hover:border-gray-200"
                      }`}
                    >
                      {selectedRoleId === 3 && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#F2A93B]" />}
                      <Building2 className={`w-6 h-6 mb-2 ${selectedRoleId === 3 ? "text-[#F2A93B]" : "text-gray-400"}`} />
                      <span className={`text-xs font-bold uppercase tracking-tighter ${selectedRoleId === 3 ? "text-[#F2A93B]" : "text-gray-500"}`}>Owner</span>
                    </div>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                  required
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">WhatsApp Number</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm font-semibold text-gray-500">+62</span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="812345678"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="pl-12 rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Password</Label>
                  {mode === "login" && (
                    <a href="#" className="text-[10px] font-bold text-[#4A90E2] hover:text-[#F2A93B] uppercase">Forgot?</a>
                  )}
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                  required
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg transition-all ${
                  selectedRoleId === 3 && mode === 'register' ? 'bg-[#F2A93B] hover:bg-[#d89632]' : 'bg-[#4A90E2] hover:bg-[#357ABD]'
                }`}
                disabled={isLoading || isRegistering}
              >
                {isLoading || isRegistering ? "Processing..." : (mode === "login" ? "Authenticate" : "Create Account")}
              </Button>
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-sm text-[#8E8E8E]"
              >
                {mode === "login" ? (
                  <>New to program? <span className="text-[#F2A93B] font-black underline">Join Network</span></>
                ) : (
                  <>Already have an account? <span className="text-[#F2A93B] font-black underline">Secure Login</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual Section */}
      <div className="hidden lg:flex bg-[#4A90E2] dark:bg-neutral-900 items-center justify-center p-12 relative overflow-hidden transition-colors duration-500">
         {/* Background Glow dinamis mengikuti role */}
        <div className={`absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] opacity-10 rounded-full blur-3xl transition-colors duration-500 ${selectedRoleId === 3 && mode === 'register' ? 'bg-white' : 'bg-[#F2A93B]'}`}></div>
        
        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl space-y-8">
            <div className="aspect-square relative rounded-[2rem] overflow-hidden border-4 border-white/30">
              <Image src="/image-login.jpg" alt="Experience" fill className="object-cover" unoptimized />
            </div>
            <div className="text-white space-y-4">
              <h2 className="text-3xl font-black leading-tight tracking-tighter">
                {selectedRoleId === 3 && mode === 'register' ? "Scale Your Business" : "Accelerate Your"} 
                <span className="text-[#F2A93B]"> {selectedRoleId === 3 && mode === 'register' ? "to the Next Level." : "Earnings Journey."}</span>
              </h2>
              <p className="text-white/70 text-sm">
                {selectedRoleId === 3 && mode === 'register' 
                  ? "Manage your agents, track conversion rates, and optimize your sales funnel effortlessly." 
                  : "Monitor leads, prevent fraud, and scale your capital with our omni-channel system."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}