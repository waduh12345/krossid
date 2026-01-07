"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Timer, Fingerprint, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

const recoveryInfo = [
  {
    id: 1,
    title: "Secure\nAccount Recovery.",
    quote: "Verifikasi dua langkah memastikan hanya pemilik akun sah yang dapat melakukan perubahan kredensial keamanan.",
    tag: "Recovery Shield"
  },
  {
    id: 2,
    title: "Protect your\nDigital Identity.",
    quote: "Jangan pernah memberikan kode verifikasi ini kepada siapa pun, termasuk pihak yang mengaku dari Kross.id.",
    tag: "Identity Guard"
  }
];

const OTPResetPage = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resend
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value: string, i: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[i] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    // Simulasi verifikasi kode OTP reset
    setTimeout(() => {
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Code Verified",
        text: "Identitas terkonfirmasi. Silakan buat password baru Anda.",
        confirmButtonColor: "#367CC0"
      }).then(() => {
        router.push('/reset-password/new'); // Arahkan ke halaman input password baru
      });
    }, 2000);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#367CC0] relative overflow-hidden font-sans p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0] via-[#5da2e6] to-[#DF9B35] opacity-90"></div>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-2xl flex flex-col md:flex-row p-6 m-4">
        
        {/* Left Section: OTP Reset Form */}
        <div className="flex-1 p-8 lg:p-12 text-white">
          <div className="mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-10 border border-white/10">
              <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                 <div className="w-2 h-2 bg-[#DF9B35] rounded-full"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Identity Verification</h1>
            <p className="text-white/70 text-sm italic">Enter the security code to authorize your password reset.</p>
          </div>

          <form onSubmit={handleVerifyReset} className="space-y-10">
            <div className="flex justify-between gap-2 md:gap-4">
              {otp.map((data, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={data}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-full h-14 md:h-16 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:ring-2 focus:ring-[#DF9B35] focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <div className="space-y-6">
              <button 
                type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Confirm Identity <ArrowRight className="w-5 h-5" /></>}
              </button>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/60">
                  <Timer className="w-4 h-4" />
                  <span>Request new code in <span className="text-[#DF9B35] font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                </div>
                {timer === 0 && (
                  <button type="button" onClick={() => setTimer(59)} className="text-[#DF9B35] font-bold underline underline-offset-4 hover:text-white transition-colors text-sm">
                    Resend Security Code
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-12 text-center">
            <Link href="/forgot-password" title="Back to Forgot Password" className="text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to <span className="font-bold underline underline-offset-4 text-white text-xs">Reset Request</span>
            </Link>
          </div>
        </div>

        {/* Right Section: Dark Card with SMOOTH CONCAVE NOTCH */}
        <div className="flex-1 relative hidden md:block">
          <div 
            className="h-full w-full bg-[#0a0a0a] rounded-[40px] p-12 flex flex-col relative overflow-hidden shadow-inner"
            style={{ WebkitMaskImage: 'radial-gradient(circle 55px at 100% 0%, transparent 100%, black 101%)' }}
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
                  <h2 className="text-[40px] font-bold text-white leading-tight tracking-tight">
                    {recoveryInfo[index].title}
                  </h2>
                  <div className="text-5xl text-[#DF9B35] leading-none italic font-serif opacity-80">“</div>
                  <p className="text-white/60 text-lg leading-relaxed italic font-light">
                    "{recoveryInfo[index].quote}"
                  </p>
                  <div>
                    <h4 className="text-white text-xl font-bold">{recoveryInfo[index].tag}</h4>
                    <p className="text-[#367CC0] text-sm mt-1 font-bold uppercase tracking-widest">Security Protocol</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2">
                <button onClick={() => setIndex(0)} className={`h-1.5 rounded-full transition-all ${index === 0 ? "bg-[#DF9B35] w-8" : "bg-white/20 w-2"}`} />
                <button onClick={() => setIndex(1)} className={`h-1.5 rounded-full transition-all ${index === 1 ? "bg-[#DF9B35] w-8" : "bg-white/20 w-2"}`} />
              </div>
            </div>

            <div className="absolute right-[-20px] bottom-10 opacity-20 pointer-events-none">
                <Fingerprint className="w-72 h-72 text-[#367CC0] rotate-12" />
            </div>
          </div>

          {/* Floating White Card */}
          <div 
            className="absolute -bottom-8 -right-4 w-[300px] bg-white p-8 pt-12 rounded-[32px] shadow-2xl z-20 border border-gray-100"
            style={{ WebkitMaskImage: 'radial-gradient(circle 50px at 100% 0%, transparent 100%, black 101%)' }}
          >
             <div className="flex items-center gap-2 mb-3 text-[#7ED321]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Two-Factor Active</span>
             </div>
             <h5 className="font-black text-gray-900 text-sm leading-snug mb-3 uppercase tracking-tighter">
               Authorized account recovery in progress
             </h5>
             <div className="flex items-center -space-x-2">
                {[1,2,3,4].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/150?u=resetotp${i+180}`} alt="user" />
                ))}
                <div className="w-8 h-8 rounded-full bg-[#DF9B35] text-white text-[9px] flex items-center justify-center border-2 border-white font-black shadow-sm">+2</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OTPResetPage;