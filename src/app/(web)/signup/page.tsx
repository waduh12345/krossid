"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { useRegisterMutation, useResendOtpMutation, useValidateEmailOtpMutation } from "@/services/auth.service";
import { useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/language-switcher";

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useI18n();

  // Step management
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Form Data
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // API Hooks
  const [register] = useRegisterMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [validateEmailOtp, { isLoading: isValidating }] = useValidateEmailOtpMutation();

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear errors when typing
    if (name === "email" && errors.email) setErrors({ ...errors, email: "" });
    if (name === "password" && errors.password) setErrors({ ...errors, password: "" });
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!isValidEmail(form.email)) {
      newErrors.email = t.home.registerModal.invalidEmailText;
      isValid = false;
    }

    if (form.password.length < 8) {
      newErrors.password = t.home.registerModal.passwordMinHint;
      isValid = false;
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password = t.home.registerModal.passwordMismatch;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle registration (step 1 -> step 2)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await register({ ...form, role: "user" }).unwrap();
      
      // Store token for OTP verification
      if (result?.data?.token) {
        setAuthToken(result.data.token);
        sessionStorage.setItem("temp_reg_token", result.data.token);
      }
      
      // Move to OTP step
      setStep(2);
      setResendCountdown(60);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.signup.registrationFailed,
        text: err?.data?.message || t.signup.registrationFailedText,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP verification and auto-login
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    try {
      await validateEmailOtp({ email: form.email, otp }).unwrap();
      
      // Show success message briefly
      Swal.fire({
        icon: "success",
        title: t.signup.registrationSuccess,
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="margin-bottom: 10px; font-size: 16px;">${t.signup.registrationSuccessText}</p>
            <p style="color: #6b7280; font-size: 14px;">${t.home.registerModal.loggingIn}</p>
          </div>
        `,
        confirmButtonColor: "#10b981",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
      });

      // Auto-login with credentials
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (loginRes?.ok) {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSessionAndRedirect = async () => {
          const session = await getSession();
          
          if (session?.user?.roles && Array.isArray(session.user.roles) && session.user.roles.length > 0) {
            const firstRole = session.user.roles[0];
            const userRole = typeof firstRole === "object" && "name" in firstRole 
              ? firstRole.name 
              : typeof firstRole === "string" 
              ? firstRole 
              : null;

            if (userRole === "superadmin" || userRole === "owner") {
              router.push("/cms");
            } else {
              router.push("/home");
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkSessionAndRedirect, 200);
          } else {
            router.push("/home");
          }
        };

        setTimeout(checkSessionAndRedirect, 100);
      } else {
        router.push("/signin");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.home.registerModal.otpInvalid,
        text: err?.data?.message || t.home.registerModal.otpInvalidText,
        confirmButtonColor: "#ef4444",
      });
      setOtp("");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!authToken || resendCountdown > 0 || isResending) return;

    try {
      await resendOtp(authToken).unwrap();
      setResendCountdown(60);
      Swal.fire({
        icon: "success",
        title: t.home.registerModal.otpSent,
        text: t.home.registerModal.otpSentText,
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to resend OTP",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // OTP input handler with auto-focus
  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    
    if (numericValue.length <= 1) {
      const newOtp = otp.split("");
      newOtp[index] = numericValue;
      setOtp(newOtp.join(""));

      if (numericValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length > 1) {
      const pastedOtp = numericValue.slice(0, 6);
      setOtp(pastedOtp);
      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      otpInputRefs.current[lastIndex]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Open email app helpers
  const openEmailApp = (provider: "gmail" | "yahoo" | "outlook") => {
    const urls = {
      gmail: "https://mail.google.com",
      yahoo: "https://mail.yahoo.com",
      outlook: "https://outlook.live.com",
    };
    window.open(urls[provider], "_blank");
  };

  const isStep1Valid = form.email && form.password && form.password_confirmation && 
    form.password === form.password_confirmation && form.password.length >= 8;
  const isStep2Valid = otp.length === 6;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#367CC0] relative overflow-hidden font-sans">
      {/* Back to Home - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/kross-id.png"
            alt="Kross ID Logo"
            width={40}
            height={40}
          />
          <span className="font-black text-white text-xl">KROSS<span className="text-[#DF9B35]">.ID</span></span>
        </Link>
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

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
        {/* Left Section: Form */}
        <div className="flex-1 p-2 lg:p-12 text-white overflow-y-auto max-h-[90vh] md:max-h-none">
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
                <h1 className="md:text-4xl text-2xl font-bold tracking-tight">
                  {step === 2 ? t.home.registerModal.otpTitle : t.signup.createAccount}
                </h1>
                <p className="text-white/70 text-sm italic">
                  {step === 2 ? (
                    <>
                      {t.home.registerModal.otpSubtitle}{" "}
                      <span className="text-[#DF9B35] font-semibold">{form.email}</span>
                    </>
                  ) : (
                    t.signup.joinNetwork
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= 1 ? "bg-[#DF9B35] text-white" : "bg-white/10 text-white/40"
              }`}>
                {step > 1 ? <CheckCircle2 size={18} /> : "1"}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-white" : "text-white/40"}`}>
                Info
              </span>
            </div>
            <div className={`flex-1 h-1 rounded-full transition-all ${
              step >= 2 ? "bg-[#DF9B35]" : "bg-white/10"
            }`} />
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= 2 ? "bg-[#DF9B35] text-white" : "bg-white/10 text-white/40"
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-white" : "text-white/40"}`}>
                Verify
              </span>
            </div>
          </div>

          {/* Form Container */}
          <div className="min-h-[320px]">
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onSubmit={handleRegister}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                      {t.signup.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="email"
                        name="email"
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder={t.signup.emailPlaceholder}
                        className={`w-full bg-black/40 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400 ml-4 flex items-center gap-1">
                        <X size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                      {t.signup.passwordLabel}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={t.signup.passwordPlaceholder}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                        required
                      />
                    </div>
                    <div className="h-5 ml-4">
                      {form.password && form.password.length < 8 && (
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <Sparkles size={12} />
                          {t.home.registerModal.passwordMinHint}
                        </p>
                      )}
                      {form.password && form.password.length >= 8 && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {t.home.registerModal.passwordStrong}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">
                      {t.signup.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        placeholder={t.signup.confirmPasswordPlaceholder}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                        required
                      />
                    </div>
                    <div className="h-5 ml-4">
                      {form.password_confirmation && form.password !== form.password_confirmation && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <X size={12} />
                          {t.home.registerModal.passwordMismatch}
                        </p>
                      )}
                      {form.password_confirmation && form.password === form.password_confirmation && form.password.length >= 8 && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {t.home.registerModal.passwordMatch}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !isStep1Valid}
                    className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] disabled:bg-[#DF9B35]/50 disabled:cursor-not-allowed rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{t.signup.processing}</span>
                      </>
                    ) : (
                      <>
                        {t.home.registerModal.continue}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  {/* OTP Input */}
                  <div className="space-y-4">
                    <label className="block text-xs text-white/50 font-bold uppercase tracking-widest text-center">
                      {t.home.registerModal.otpPlaceholder}
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={otp[index] || ""}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                            setOtp(pastedData);
                            const lastIndex = Math.min(pastedData.length - 1, 5);
                            otpInputRefs.current[lastIndex]?.focus();
                          }}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-black/40 border-2 border-white/10 text-white rounded-2xl focus:border-[#DF9B35] focus:ring-2 focus:ring-[#DF9B35]/30 outline-none transition-all"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Email Access Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/50 text-center">
                      {t.home.registerModal.checkEmail}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEmailApp("gmail")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-black/30 hover:bg-black/40 border border-white/10 rounded-full text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                        {t.home.registerModal.openGmail}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEmailApp("yahoo")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-black/30 hover:bg-black/40 border border-white/10 rounded-full text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.828 12.834l4.428-7.633h-3.32l-2.733 5.14-2.936-5.14h-3.44l4.553 7.633v5.965h3.448v-5.965zm4.32-7.633h3.32l-4.428 7.633v5.965h-3.448v-5.965l-4.553-7.633h3.44l2.936 5.14 2.733-5.14z"/>
                        </svg>
                        {t.home.registerModal.openYahoo}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEmailApp("outlook")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-black/30 hover:bg-black/40 border border-white/10 rounded-full text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.231-.584.231h-8.462v-6.884l1.736 1.242 1.32-.944V9.478l-1.32.908-1.736-1.213V5.019h8.462c.232 0 .426.077.584.231.158.152.238.346.238.576v1.561zm-10.262-2.368v15.9H0V5.02h13.738zm-2.09 6.136c0-.893-.238-1.604-.713-2.133-.475-.53-1.103-.794-1.885-.794-.78 0-1.408.264-1.883.794-.476.529-.713 1.24-.713 2.133 0 .888.237 1.596.713 2.124.475.527 1.103.791 1.883.791.782 0 1.41-.264 1.885-.791.475-.528.713-1.236.713-2.124z"/>
                        </svg>
                        {t.home.registerModal.openOutlook}
                      </button>
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-2">
                      {t.home.registerModal.didntReceive}
                    </p>
                    {resendCountdown > 0 ? (
                      <p className="text-xs text-white/60">
                        {t.home.registerModal.resendOtpIn}{" "}
                        <span className="text-[#DF9B35] font-bold">{resendCountdown}</span>{" "}
                        {t.home.registerModal.seconds}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="text-xs text-[#DF9B35] hover:text-[#c78a2e] font-semibold flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
                      >
                        {isResending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        {t.home.registerModal.resendOtp}
                      </button>
                    )}
                    <p className="text-[10px] text-white/30 mt-2">
                      {t.home.registerModal.checkSpam}
                    </p>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="button"
                    disabled={isValidating || !isStep2Valid}
                    onClick={handleVerifyOtp}
                    className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] disabled:bg-[#DF9B35]/50 disabled:cursor-not-allowed rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{t.home.registerModal.verifying}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        <span>{t.home.registerModal.verifyOtp}</span>
                      </>
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3 text-white/60 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="rotate-180" size={16} />
                    Back to Info
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-300">
              {t.signup.alreadyMember}{" "}
              <Link
                href="/signin"
                className="text-white font-bold underline underline-offset-4 hover:text-[#DF9B35] transition-colors"
              >
                {t.signup.signInSecurely}
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section: Black Card with Image */}
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
              alt="Hero Register"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
