"use client";

import { useState } from "react";
import Image from "next/image";

export default function AffiliateHome() {
  // Simulasi Masked Identity untuk Live Activity
  const livePayouts = [
    { id: 1, email: "us***12@bsi.ac.id", amount: "IDR 250.000", time: "2 mins ago" },
    { id: 2, email: "he***an@gmail.com", amount: "IDR 1.200.000", time: "5 mins ago" },
    { id: 3, email: "ni***ta@corporate.com", amount: "IDR 450.000", time: "8 mins ago" },
  ];

  const PROGRAMS = [
    {
      id: 1,
      code: "PROMO-001",
      title: "Digital Asset Accelerator",
      sub: "BSI Domain Exclusive",
      desc: "Program khusus untuk pemilik aset digital dengan komisi flat per lead yang valid.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
      status: "Active",
      commission: "Flat Based"
    },
    {
      id: 2,
      code: "PROMO-002",
      title: "Global Traffic Harvester",
      sub: "All Networks",
      desc: "Optimalkan traffic sosial media Anda menjadi penghasilan pasif dengan skema dinamis.",
      image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=500",
      status: "Active",
      commission: "Dynamic"
    }
  ];

  return (
    <div className="bg-white text-[#1A1A1A]">
      {/* --- HERO: Traffic Harvester --- */}
      <section className="relative bg-[#4A90E2] py-24 overflow-hidden">
        {/* Abstract Background Element (Logo Shape) */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F2A93B] opacity-10 rounded-l-full translate-x-1/4"></div>
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <span className="w-2 h-2 bg-[#7ED321] rounded-full animate-pulse"></span>
              PUBLIC AFFILIATE PROGRAM READY
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Turn Your <span className="text-[#F2A93B]">Social Capital</span> Into Revenue.
            </h1>
            <p className="text-xl opacity-90 mb-10 font-light max-w-lg leading-relaxed">
              Platform omni-channel untuk mengelola trafik, memantau performa, dan mencairkan komisi secara transparan.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#F2A93B] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                Become an Agent
              </button>
              <button className="border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10">
                Explore Programs
              </button>
            </div>
          </div>

          {/* Simple Form (Traffic Harvester Tool) */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
            <h3 className="text-xl font-bold mb-2">Check Eligibility</h3>
            <p className="text-sm text-[#8E8E8E] mb-6">Masukkan email institusi Anda untuk melihat program eksklusif.</p>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="name@domain.ac.id" 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A90E2] transition-all"
                />
              </div>
              <button className="w-full bg-[#7ED321] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#6cb91b] transition-all flex items-center justify-center gap-2">
                Scan Available Programs <i className="fas fa-search text-sm"></i>
              </button>
              <p className="text-[10px] text-center text-[#8E8E8E] uppercase tracking-tighter">
                <i className="fas fa-shield-alt mr-1"></i> Secured by Fraud Prevention System v2.0
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE ACTIVITY: Masked Identity --- */}
      <section className="bg-gray-50 py-6 border-b border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <span className="text-xs font-bold text-[#8E8E8E] uppercase tracking-widest">Live Activity:</span>
          {livePayouts.map((item) => (
            <div key={item.id} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <i className="fas fa-check-circle text-[#7ED321] text-xs"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8E8E8E]">{item.email}</p>
                <p className="text-xs font-black text-[#4A90E2]">Earned {item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROGRAMS LIST (Simple Info) --- */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-[#4A90E2] mb-4">Active Affiliate Programs</h2>
          <div className="w-20 h-1.5 bg-[#F2A93B] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {PROGRAMS.map((prog) => (
            <div key={prog.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex flex-col md:flex-row">
              <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                <Image src={prog.image} alt={prog.title} fill className="object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-[9px] font-bold text-[#4A90E2]">
                  {prog.code}
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center flex-1">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[#7ED321] text-[10px] font-bold uppercase tracking-widest">{prog.commission}</span>
                   <span className="text-[10px] bg-blue-50 text-[#4A90E2] px-2 py-0.5 rounded-full">{prog.status}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#4A90E2] transition-colors">{prog.title}</h3>
                <p className="text-xs text-[#8E8E8E] font-medium mb-4 italic">{prog.sub}</p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-2">
                  {prog.desc}
                </p>
                <button className="text-sm font-bold text-[#F2A93B] flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-wider">
                  View Program Details <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-[#fbfbfb]">
        <div className="container mx-auto px-6 text-center">
           <h2 className="text-4xl font-black text-gray-900 mb-6">Ready to Scale Your Earnings?</h2>
           <p className="text-[#8E8E8E] mb-10 max-w-xl mx-auto">Gabung dengan ribuan agen lainnya. Sistem dashboard kami sudah **API Ready** untuk integrasi ke platform apa pun.</p>
           <div className="flex justify-center gap-4">
              <button className="bg-[#4A90E2] text-white px-10 py-4 rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all">
                 Register as Agent
              </button>
              <button className="bg-white border border-gray-200 text-[#4A90E2] px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-all">
                 Inquiry for Business
              </button>
           </div>
        </div>
      </section>
    </div>
  );
}