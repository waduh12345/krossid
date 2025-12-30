"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  Github,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulasi Login
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* --- Logo & Brand --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex justify-center items-center gap-3 mb-4">
           {/* Logo Tiles Concept */}
           <div className="w-10 h-10 relative flex flex-wrap rotate-45 shrink-0">
              <div className="w-5 h-5 bg-[#F2A93B] rounded-tl-sm"></div>
              <div className="w-5 h-5 bg-[#4A90E2] rounded-tr-sm"></div>
              <div className="w-5 h-5 bg-[#8E8E8E] rounded-bl-sm"></div>
              <div className="w-5 h-5 bg-[#7ED321] rounded-br-sm"></div>
           </div>
           <h2 className="text-2xl font-black tracking-tighter text-[#4A90E2] uppercase leading-none">
             Affiliate<span className="text-[#F2A93B]">Core</span>
           </h2>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Don't miss your next opportunity. Sign in to your network.
        </p>
      </div>

      {/* --- Login Card --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white py-10 px-6 shadow-xl border border-gray-200 sm:rounded-[2rem] sm:px-12 relative overflow-hidden">
          
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#4A90E2] via-[#F2A93B] to-[#7ED321]"></div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#4A90E2] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Password</Label>
                <Link href="#" className="text-[10px] font-bold text-[#4A90E2] hover:underline uppercase tracking-tighter">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#4A90E2] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 px-1">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#4A90E2] focus:ring-[#4A90E2] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs font-bold text-gray-500 cursor-pointer">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? "Authenticating..." : "Sign In"} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* --- Social Logins --- */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="px-4 bg-white text-gray-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                <Chrome className="w-4 h-4 text-[#4285F4]" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                <div className="w-4 h-4 bg-[#0077B5] rounded-[2px] flex items-center justify-center text-[10px] text-white font-bold">in</div> LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* --- Footer Links --- */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            New to AffiliateCore?{" "}
            <Link href="/register" className="text-[#F2A93B] font-black hover:underline underline-offset-4">
              Join Agent Network
            </Link>
          </p>
          
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1">
               <ShieldCheck className="w-3 h-3 text-[#7ED321]" /> Secure Access
            </div>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </div>

      {/* --- Floating Visual Element --- */}
      <div className="hidden lg:block fixed bottom-8 right-8 max-w-[240px] bg-white p-4 rounded-2xl border border-gray-200 shadow-xl animate-bounce-slow">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#7ED321]/10 flex items-center justify-center">
               <ShieldCheck className="w-4 h-4 text-[#7ED321]" />
            </div>
            <p className="text-[10px] font-black text-gray-900 leading-tight uppercase tracking-tighter">Corporate Verified System</p>
         </div>
         <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
           Your login is encrypted with 256-bit security standards for all corporate assets.
         </p>
      </div>

    </div>
  );
}