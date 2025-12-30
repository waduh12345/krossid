"use client";

import React, { useState, useEffect } from "react";
import { 
  X, User, Mail, Lock, Phone, Zap, 
  ArrowRight, ArrowLeft, ExternalLink, 
  CheckCircle2, LogIn, UserCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react"; // Import Session
import Swal from "sweetalert2";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
};

export default function AffiliateRegisterModal({ isOpen, onClose, programTitle }: Props) {
  const { data: session, status } = useSession();
  // const isLoggedIn = status === "authenticated";
  const isLoggedIn = status === "authenticated";

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    socialLink: "",
    platform: "Instagram",
    strategy: ""
  });

  // Sinkronisasi data jika sudah login
  useEffect(() => {
    if (isLoggedIn && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
        // phone biasanya ada di session custom, sesuaikan dengan schema session Anda
        phone: (session.user as any).phone || "" 
      }));
    }
  }, [isLoggedIn, session]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 13) setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);
      await Swal.fire({
        icon: "success",
        title: "Application Sent!",
        text: `Permohonan affiliasi Anda untuk "${programTitle}" sedang ditinjau oleh Owner.`,
        confirmButtonColor: "#4A90E2",
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="relative bg-[#4A90E2] p-8 text-white">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-[#F2A93B] fill-[#F2A93B]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Affiliate Application</span>
          </div>
          <h2 className="text-2xl font-black leading-tight">Apply for {programTitle}</h2>
          <p className="text-blue-100 text-xs mt-2 italic">
            Step {step} of 2: {step === 1 ? 'Verify Identity' : 'Marketing Strategy'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8">
          
          {step === 1 ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {isLoggedIn ? (
                /* VIEW: JIKA SUDAH LOGIN (Summary) */
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#4A90E2] flex items-center justify-center text-white text-xl font-black shadow-inner">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-gray-900 dark:text-white">Logged in as {session?.user?.name}</h4>
                        <UserCheck className="w-4 h-4 text-[#7ED321]" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Your verified account info</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100/50">
                      <span className="text-[10px] font-black uppercase text-gray-400">Email</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{session?.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100/50">
                      <span className="text-[10px] font-black uppercase text-gray-400">WhatsApp</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {formData.phone ? `+62 ${formData.phone}` : "Not Set"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-[10px] text-center text-blue-400 font-bold italic">
                    *We'll use this identity for your application.
                  </p>
                </div>
              ) : (
                /* VIEW: JIKA BELUM LOGIN (Full Form) */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <Input placeholder="Enter your full name" className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-100" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <Input type="email" placeholder="name@email.com" className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-100" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">WhatsApp</Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-sm font-bold text-gray-500">+62</span>
                        <Input placeholder="812xxx" className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-100" value={formData.phone} onChange={handlePhoneChange} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <Input type="password" placeholder="Min. 6 chars" className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-100" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2 Tetap Sama */
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Primary Platform</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Instagram', 'TikTok', 'Twitter'].map((p) => (
                    <button key={p} type="button" onClick={() => setFormData({...formData, platform: p})} className={`py-2 rounded-lg text-xs font-bold border transition-all ${formData.platform === p ? 'bg-[#4A90E2] text-white border-[#4A90E2]' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Profile / Portfolio Link</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input placeholder="https://instagram.com/username" className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-100" value={formData.socialLink} onChange={(e) => setFormData({...formData, socialLink: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Marketing Strategy</Label>
                <textarea placeholder="How will you promote this program?" className="w-full p-4 text-sm rounded-xl bg-gray-50 border-gray-100 focus:ring-1 focus:ring-[#4A90E2] focus:outline-none min-h-[100px]" value={formData.strategy} onChange={(e) => setFormData({...formData, strategy: e.target.value})} required />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {step === 2 && (
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold text-gray-500" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            
            <Button 
              type={step === 1 ? "button" : "submit"} 
              disabled={isLoading}
              onClick={() => step === 1 && setStep(2)}
              className={`flex-1 h-12 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all ${
                step === 1 ? "bg-[#4A90E2] hover:bg-[#357ABD]" : "bg-[#F2A93B] hover:bg-[#d89632]"
              }`}
            >
              {isLoading ? "Processing..." : step === 1 ? (
                <div className="flex items-center gap-2">Confirm Identity <ArrowRight className="w-4 h-4" /></div>
              ) : "Submit Application"}
            </Button>
          </div>

          <p className="text-[10px] text-center text-gray-400 mt-6 font-medium px-4">
            {isLoggedIn ? "You are applying using your logged-in profile." : "By applying, you will create a new account for this network."}
          </p>
        </form>
      </div>
    </div>
  );
}