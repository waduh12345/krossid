"use client";

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// Konten keamanan untuk sisi kanan
const securityInfo = [
  {
    id: 1,
    title: "Stronger Keys,\nBetter Security.",
    quote: "Pastikan password Anda terdiri dari minimal 8 karakter dengan kombinasi angka dan simbol unik.",
    tag: "Pro Tip"
  },
  {
    id: 2,
    title: "Instant\nSynchronization.",
    quote: "Setelah diperbarui, password baru Anda akan langsung sinkron ke seluruh ekosistem layanan kami.",
    tag: "System Status"
  }
];

const ResetPasswordPage = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({ icon: "error", title: "Mismatch!", text: "Konfirmasi password tidak sesuai." });
    }

    setIsLoading(true);
    // Simulasi API Update Password
    setTimeout(() => {
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Password Updated!",
        text: "Akun Anda kini lebih aman. Silakan login kembali.",
        confirmButtonColor: "#367CC0"
      }).then(() => {
        router.push('/signin');
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#367CC0] relative overflow-hidden font-sans p-4">
      {/* Background Gradient & Grid Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0] via-[#5da2e6] to-[#DF9B35] opacity-90"></div>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Main Glass Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-2xl flex flex-col md:flex-row p-6 m-4">
        
        {/* Left Section: Reset Form */}
        <div className="flex-1 p-8 lg:p-12 text-white">
          <div className="mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-10 border border-white/10">
              <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                 <div className="w-2 h-2 bg-[#DF9B35] rounded-full"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Set New Password</h1>
            <p className="text-white/70 text-sm italic">Create a strong password for your account.</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/50 ml-4 font-bold uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#DF9B35] hover:bg-[#c78a2e] rounded-full font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] text-white flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>Update Password <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Right Section: Dark Card with SMOOTH CONCAVE NOTCH */}
        <div className="flex-1 relative hidden md:block">
          <div 
            className="h-full w-full bg-[#0a0a0a] rounded-[40px] p-12 flex flex-col relative overflow-hidden shadow-inner"
            style={{ 
              WebkitMaskImage: 'radial-gradient(circle 55px at 100% 0%, transparent 100%, black 101%)',
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
                    {securityInfo[index].title}
                  </h2>
                  <div className="text-5xl text-[#DF9B35] leading-none italic font-serif opacity-80">“</div>
                  <p className="text-white/60 text-lg leading-relaxed max-w-xs italic font-light">
                    "{securityInfo[index].quote}"
                  </p>
                  
                  <div>
                    <h4 className="text-white text-xl font-bold">{securityInfo[index].tag}</h4>
                    <p className="text-[#367CC0] text-sm mt-1 font-bold uppercase tracking-widest">Network Verified</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative Indicators */}
              <div className="flex gap-2">
                {securityInfo.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === i ? "w-8 bg-[#DF9B35]" : "w-2 bg-white/20"}`}
                  />
                ))}
              </div>
            </div>

            {/* Background Icon Graphic */}
            <div className="absolute right-[-20px] bottom-10 opacity-20 pointer-events-none">
                <CheckCircle2 className="w-72 h-72 text-[#367CC0] -rotate-12" />
            </div>
          </div>

          {/* Floating Card with SMOOTH CONCAVE NOTCH */}
          <div 
            className="absolute -bottom-8 -right-4 w-[300px] bg-white p-8 pt-12 rounded-[32px] shadow-2xl z-20 border border-gray-100"
            style={{
              WebkitMaskImage: 'radial-gradient(circle 50px at 100% 0%, transparent 100%, black 101%)',
            }}
          >
             <div className="flex items-center gap-2 mb-3 text-[#7ED321]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Update Security</span>
             </div>
             <h5 className="font-black text-gray-900 text-sm leading-snug mb-3 uppercase tracking-tighter">
               Your digital assets are now protected
             </h5>
             <div className="flex items-center -space-x-2">
                {[1,2,3,4].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/150?u=reset${i+120}`} alt="user" />
                ))}
                <div className="w-8 h-8 rounded-full bg-[#DF9B35] text-white text-[9px] flex items-center justify-center border-2 border-white font-black shadow-sm">+2</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;