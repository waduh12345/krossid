"use client";

import React from "react";
import Link from "next/link";

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {

  return (
    <section className="min-h-screen flex flex-col font-sans selection:bg-[#F2A93B] selection:text-white bg-white">
      {/* --- NAVBAR --- */}
      

      <main className="flex-grow">{children}</main>

      {/* --- FOOTER (Clean & Professional) --- */}
      <footer className="bg-[#f8f9fa] border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 opacity-80 grayscale">
                <div className="w-6 h-6 bg-black rounded-sm"></div>
                <span className="font-bold text-black">AFFILIATECORE</span>
              </div>
              <p className="text-[#8E8E8E] text-sm leading-relaxed">
                Platform afiliasi publik dengan sistem Masked Identity dan tracking real-time. Kelola trafik Anda secara profesional.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4A90E2] uppercase tracking-widest mb-6">Network</h4>
              <ul className="space-y-3 text-sm text-[#8E8E8E]">
                <li><Link href="#" className="hover:text-[#4A90E2]">Traffic Harvester</Link></li>
                <li><Link href="#" className="hover:text-[#4A90E2]">Referral Engine</Link></li>
                <li><Link href="#" className="hover:text-[#4A90E2]">API Integration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4A90E2] uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-[#8E8E8E]">
                <li><Link href="#" className="hover:text-[#4A90E2]">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#4A90E2]">Fraud Prevention</Link></li>
                <li><Link href="#" className="hover:text-[#4A90E2]">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#4A90E2] uppercase tracking-widest mb-6">Office</h4>
              <p className="text-sm text-[#8E8E8E]">Kawasan Niaga Terpadu, Jakarta.<br/>support@affiliatecore.io</p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#8E8E8E] uppercase tracking-widest font-bold">
            <p>© 2025 AffiliateCore System. All Rights Reserved.</p>
            <div className="flex gap-6">
              <span>Status: <span className="text-[#7ED321]">API Online</span></span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}