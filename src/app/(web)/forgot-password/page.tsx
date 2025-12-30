"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulasi pengiriman email pemulihan
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        {/* Logo Brand */}
        <div className="flex justify-center items-center gap-3 mb-8">
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

        {!isSubmitted ? (
          <>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Password Reset</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium px-4">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
               <CheckCircle2 className="w-8 h-8 text-[#7ED321]" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Check your email</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium px-4">
              We've sent a password reset link to <span className="text-gray-900 font-black">{email}</span>
            </p>
          </>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white py-10 px-6 shadow-xl border border-gray-200 sm:rounded-[2rem] sm:px-12 relative overflow-hidden transition-all">
          
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#4A90E2]"></div>

          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#4A90E2] transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? "Sending Link..." : "Send Reset Link"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <Link 
                href="/signin" 
                className="flex items-center justify-center gap-2 text-xs font-black text-gray-400 hover:text-[#4A90E2] transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                Didn't receive the email? Check your spam folder or try another email address.
              </p>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                className="w-full py-6 bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50 rounded-xl font-black uppercase tracking-widest transition-all"
              >
                Try Another Email
              </Button>

              <Link 
                href="/signin" 
                className="block text-xs font-black text-[#4A90E2] hover:underline uppercase tracking-widest"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
             <LifeBuoy className="w-4 h-4 text-[#F2A93B]" />
             <span>Still having trouble?</span>
             <Link href="#" className="text-[#4A90E2] hover:underline">Contact Support</Link>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1">
               <ShieldCheck className="w-3 h-3 text-[#7ED321]" /> Verified Security
            </div>
            <span>•</span>
            <span>256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}