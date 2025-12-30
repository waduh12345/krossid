"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Lock, 
  CreditCard, 
  Info,
  Clock,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BuyJoinProgram() {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  // Simulasi Data Program
  const program = {
    title: "Digital Skill Bootcamp 2025",
    owner: "EduTech Global",
    price: 1500000,
    discount: 0,
    tax: 0,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
  };

  const total = program.price - program.discount + program.tax;

  return (
    <div className="bg-[#F4F2EE] min-h-screen font-sans pb-20">
      {/* HEADER NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <button className="flex items-center gap-2 text-gray-500 hover:text-[#4A90E2] font-bold text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Program
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Checkout Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: User Identity */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#4A90E2] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Personal Information
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Required for Access</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Name</Label>
                  <Input placeholder="Enter your name" className="rounded-xl bg-gray-50 border-gray-100 h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</Label>
                  <Input type="email" placeholder="name@email.com" className="rounded-xl bg-gray-50 border-gray-100 h-11" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">WhatsApp Number</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-gray-500">+62</span>
                    <Input placeholder="812xxx" className="pl-12 rounded-xl bg-gray-50 border-gray-100 h-11" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#4A90E2] text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                  Select Payment Method
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { id: "bank_transfer", label: "Bank Transfer (Manual)", sub: "Verified within 1 hour", icon: <CreditCard className="w-4 h-4" /> },
                  { id: "e_wallet", label: "E-Wallet (QRIS)", sub: "Instant Activation", icon: <Zap className="w-4 h-4 text-[#F2A93B]" /> },
                  { id: "credit_card", label: "Credit Card", sub: "Visa / Mastercard", icon: <Lock className="w-4 h-4 text-[#7ED321]" /> }
                ].map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === m.id ? "border-[#4A90E2] bg-blue-50/30" : "border-gray-50 hover:border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === m.id ? "bg-white text-[#4A90E2] shadow-sm" : "bg-gray-100 text-gray-400"}`}>
                        {m.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${paymentMethod === m.id ? "text-gray-900" : "text-gray-500"}`}>{m.label}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{m.sub}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? "border-[#4A90E2]" : "border-gray-200"}`}>
                      {paymentMethod === m.id && <div className="w-2.5 h-2.5 bg-[#4A90E2] rounded-full"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden sticky top-24">
              <div className="p-8">
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6">Order Summary</h3>
                
                {/* Product Info */}
                <div className="flex gap-4 pb-6 border-b border-gray-100 mb-6">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                    <Image src={program.image} alt="Program" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-black text-gray-900 leading-tight">{program.title}</h4>
                    <p className="text-[10px] font-bold text-[#4A90E2] uppercase tracking-tighter mt-1">{program.owner}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span>IDR {program.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Discount</span>
                    <span className="text-[#7ED321]">- IDR {program.discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="font-black text-gray-900">Total Payment</span>
                    <span className="text-xl font-black text-[#4A90E2]">IDR {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-8">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#7ED321]" />
                      <p className="text-[11px] font-bold text-gray-600">Secure 256-bit SSL encrypted payment</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#4A90E2]" />
                      <p className="text-[11px] font-bold text-gray-600">Lifetime access & instant activation</p>
                   </div>
                </div>

                <Button className="w-full h-14 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group">
                  Complete Purchase <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Info className="w-3 h-3 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Refund Policy applies</p>
                </div>
              </div>

              {/* Security Footer */}
              <div className="bg-gray-900 py-4 flex items-center justify-center gap-6">
                 <Lock className="w-3 h-3 text-gray-400" />
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Guaranteed Safe Checkout</p>
                 <div className="flex gap-2 opacity-50 grayscale">
                    <div className="w-6 h-4 bg-white rounded-sm"></div>
                    <div className="w-6 h-4 bg-white rounded-sm"></div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}