"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  Users, 
  Building2, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [role, setRole] = useState<2 | 3>(2); // 2: Affiliator, 3: Owner
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 13) setFormData({ ...formData, phone: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({ icon: "error", title: "Oops!", text: "Konfirmasi password tidak cocok." });
    }

    setIsLoading(true);
    // Simulasi API
    setTimeout(() => {
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Account Created",
        text: `Selamat bergabung sebagai ${role === 3 ? "Owner" : "Affiliator"}!`,
        confirmButtonColor: role === 3 ? "#F2A93B" : "#4A90E2"
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] grid grid-cols-1 lg:grid-cols-12 font-sans">
      
      {/* --- LEFT SIDE: Brand Experience --- */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#4A90E2] relative overflow-hidden flex-col justify-center p-12 text-white">
        {/* Abstract Background Tiles */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[20rem] h-[20rem] bg-[#F2A93B] rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-[#4A90E2] text-2xl rotate-12 shadow-xl">A</div>
             <h1 className="text-3xl font-black uppercase tracking-tighter italic">AffiliateCore</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-black leading-tight">
              Scale your <br />
              <span className={role === 3 ? "text-[#F2A93B]" : "text-white opacity-80"}>Digital Assets</span> with Confidence.
            </h2>
            <p className="text-lg text-blue-100 font-medium max-w-md">
              {role === 3 
                ? "Manage agents, distribute programs, and track corporate performance in one dashboard."
                : "Join the elite network, promote verified products, and harvest your social capital."}
            </p>
          </div>

          <div className="pt-10 flex items-center gap-6">
             <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#4A90E2] bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=reg${i}`} alt="user" />
                  </div>
                ))}
             </div>
             <p className="text-sm font-bold text-blue-50">Join 2.5k+ professionals today</p>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Registration Form --- */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[500px] space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-gray-500 font-medium mt-2">Choose your professional identity to get started.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* ROLE SELECTION */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setRole(2)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 group ${
                  role === 2 ? "border-[#4A90E2] bg-blue-50/50 ring-1 ring-[#4A90E2]" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 2 ? "bg-[#4A90E2] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 transition-colors"}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${role === 2 ? "text-[#4A90E2]" : "text-gray-400"}`}>Affiliator</span>
              </div>

              <div 
                onClick={() => setRole(3)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 group ${
                  role === 3 ? "border-[#F2A93B] bg-orange-50/50 ring-1 ring-[#F2A93B]" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 3 ? "bg-[#F2A93B] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 transition-colors"}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${role === 3 ? "text-[#F2A93B]" : "text-gray-400"}`}>Product Owner</span>
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-11 h-12 rounded-xl bg-white border-gray-200 focus:border-[#4A90E2]"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="email"
                    placeholder="name@email.com" 
                    className="pl-11 h-12 rounded-xl bg-white border-gray-200"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">WhatsApp</Label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-gray-500">+62</span>
                  <Input 
                    placeholder="812xxx" 
                    className="pl-12 h-12 rounded-xl bg-white border-gray-200"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password"
                    placeholder="Min. 6 characters" 
                    className="pl-11 h-12 rounded-xl bg-white border-gray-200"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password"
                    placeholder="Re-type password" 
                    className="pl-11 h-12 rounded-xl bg-white border-gray-200"
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-7 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 ${
                role === 3 
                ? "bg-[#F2A93B] hover:bg-[#d89632] shadow-orange-500/20" 
                : "bg-[#4A90E2] hover:bg-[#357ABD] shadow-blue-500/20"
              }`}
            >
              {isLoading ? "Creating Account..." : "Join the Network"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 font-medium">
              Already a member?{" "}
              <Link href="/signin" className="text-[#4A90E2] font-black hover:underline underline-offset-4 transition-all">
                Sign In Securely
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7ED321]" />
              Data Encryption & Corporate Verified System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}