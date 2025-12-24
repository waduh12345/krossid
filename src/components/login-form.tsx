"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { Combobox } from "@/components/ui/combo-box";
import type { School } from "@/types/master/school";
import type { Register } from "@/types/user";
import { useRegisterMutation } from "@/services/auth.service";
import { useGetSchoolListPublicQuery } from "@/services/master/school.service";
import { Link } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [manualSchoolName, setManualSchoolName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [schoolSearch, setSchoolSearch] = React.useState<string>("");
  const { data: schoolListResp, isFetching: loadingSchools } = useGetSchoolListPublicQuery({ page: 1, paginate: 30, search: schoolSearch });
  const schools: School[] = schoolListResp?.data ?? [];
  const [schoolId, setSchoolId] = React.useState<number | null>(null);

  const resolvedSchoolName = useMemo(() => manualSchoolName.trim(), [manualSchoolName]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
        router.push("/");
      } else {
        setError("Email atau password salah.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // basic validation
    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!phone.trim()) {
      setError("No. Whatsapp wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }

    // school_name must exist (manual only)
    const schoolNameToSend = resolvedSchoolName;
    if (!schoolNameToSend && !schoolId) {
      setError("Ketik nama sekolah Anda (manual).");
      return;
    }

    const payload: Register = {
      school_name: schoolNameToSend,
      school_id: schoolId ?? undefined,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      password_confirmation: passwordConfirmation,
    };

    setIsLoading(true);
    try {
      // call register endpoint
      await registerMutation(payload).unwrap();

      // try auto-login
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: payload.email,
        password: payload.password,
      });

      if (signInRes?.ok) {
        router.push("/");
      } else {
        // fallback: switch to login mode with success message
        setMode("login");
        setPassword("");
        setPasswordConfirmation("");
        setManualSchoolName("");
        setError("Pendaftaran berhasil. Silakan login menggunakan akun Anda.");
      }
    } catch (err: unknown) {
      // handle error safely
      let msg = "Gagal mendaftar.";
      try {
        if (typeof err === "string") {
          msg = err;
        } else if (err instanceof Error) {
          msg = err.message;
        } else if (typeof err === "object" && err !== null) {
          const e = err as Record<string, unknown>;
          if ("data" in e && typeof e.data === "object" && e.data !== null) {
            const d = e.data as Record<string, unknown>;
            if ("message" in d && typeof d.message === "string") {
              msg = d.message;
            }
          } else if ("message" in e && typeof e.message === "string") {
            msg = e.message;
          }
        }
      } catch {
        // ignore
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFBFC] dark:bg-neutral-950 transition-colors duration-300">
      
      {/* Dark Mode Toggle - Positioned for better UX */}
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-full p-1 border border-gray-100 dark:border-neutral-800">
          <ModeToggle />
        </div>
      </div>

      {/* Left Column: Form Section */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo Brand Representation */}
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
              {mode === "login" ? "Welcome Back" : "Create Agent Account"}
            </h1>
            <p className="text-[#8E8E8E] text-sm">
              {mode === "login"
                ? "Manage your social capital and track your earnings."
                : "Join our network and start harvesting traffic today."}
            </p>
          </div>

          <form
            onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-5"
          >
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-50 dark:border-neutral-800 space-y-5">
              
              {mode === "register" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] focus:ring-[#4A90E2]/10 transition-all h-12"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Institution / School</Label>
                    <Combobox<School>
                      value={schoolId}
                      onChange={(v) => setSchoolId(v)}
                      onSearchChange={setSchoolSearch}
                      data={schools}
                      isLoading={loadingSchools}
                      placeholder="Select Institution"
                      getOptionLabel={(s) => s.name}
                    />
                    <Input
                      placeholder="Or type manually if not listed..."
                      value={manualSchoolName}
                      onChange={(e) => setManualSchoolName(e.target.value)}
                      className="mt-2 rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-11 text-sm italic"
                    />
                  </div>
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
                  <Input
                    type="tel"
                    placeholder="0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 focus:border-[#4A90E2] h-12"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-[#8E8E8E] tracking-widest ml-1">Password</Label>
                  {mode === "login" && (
                    <a href="/forgot-password" className="text-[10px] font-bold text-[#4A90E2] hover:text-[#F2A93B] uppercase tracking-tighter">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                disabled={isLoading || isRegistering}
              >
                {isLoading || isRegistering ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-circle-notch animate-spin"></i> Processing...
                  </span>
                ) : (
                  mode === "login" ? "Authenticate" : "Create Account"
                )}
              </Button>
            </div>

            {/* Mode Switcher */}
            <div className="text-center pt-4">
              {mode === "login" ? (
                <p className="text-sm text-[#8E8E8E]">
                  New to our program?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-[#F2A93B] font-black hover:underline underline-offset-4"
                  >
                    Join Affiliator
                  </button>
                </p>
              ) : (
                <p className="text-sm text-[#8E8E8E]">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#F2A93B] font-black hover:underline underline-offset-4"
                  >
                    Secure Login
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Visual Brand Experience (Hidden on Mobile) */}
      <div className="hidden lg:flex bg-[#4A90E2] dark:bg-neutral-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Abstract shapes representing the Logo Colors */}
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#F2A93B] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#7ED321] opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl space-y-8">
            <div className="aspect-square relative rounded-[2rem] overflow-hidden border-4 border-white/30">
              <Image
                src="/image-login.jpg"
                alt="Traffic Harvester Experience"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-white space-y-4">
              <h2 className="text-3xl font-black leading-tight tracking-tighter">
                Accelerate Your 
                <span className="text-[#F2A93B]"> Earnings Journey.</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Monitor your leads, prevent fraud activity, and scale your social capital with our omni-channel referral engine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}