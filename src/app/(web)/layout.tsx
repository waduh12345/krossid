"use client";

import React from "react";
import Link from "next/link";

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {

  return (
    <section className="bg-[#F4F2EE] min-h-screen font-sans text-[#1A1A1A]">
      {/* --- NAVBAR --- */}
      {/* --- TOP HEADER / NAV SIMULATION --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4A90E2] rounded flex items-center justify-center font-black text-white text-xl italic"></div>
            <span className="font-black text-xl tracking-tighter text-[#4A90E2]">Kross<span className="text-[#F2A93B]">.id</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-wider">
            <Link href="/home" className="text-[#4A90E2] border-b-2 border-[#4A90E2] pb-1">Feed</Link>
            <Link href="/programs" className="hover:text-[#4A90E2] transition-colors">Marketplace</Link>
            <Link href="/network" className="hover:text-[#4A90E2] transition-colors">Network</Link>
          </div>
          <div className="flex gap-3">
            <Link href="/signin" className="text-sm font-bold text-[#4A90E2] hover:bg-blue-50 px-4 py-2 rounded-full transition-all">Sign In</Link>
            <Link href="/signup" className="text-sm font-bold bg-[#4A90E2] text-white px-5 py-2 rounded-full hover:bg-[#357ABD] shadow-md transition-all">Join Now</Link>
          </div>
        </div>
      </nav>
      

      <main className="flex-grow">{children}</main>

      {/* --- FOOTER (Clean & Professional) --- */}
      <footer className="bg-[#f8f9fa] border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 opacity-80 grayscale">
                <div className="w-6 h-6 bg-black rounded-sm"></div>
                <span className="font-bold text-black">Kross.id</span>
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
            <p>© 2025 Kross.id. All Rights Reserved.</p>
            <div className="flex gap-6">
              <span>Status: <span className="text-[#7ED321]">API Online</span></span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}