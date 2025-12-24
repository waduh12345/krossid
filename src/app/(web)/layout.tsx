"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState("ID");

  const menuItems = [
    { name: "Programs", href: "/programs" },
    { name: "Affiliator", href: "/agents" },
    { name: "Earnings", href: "/earnings" },
    { name: "API Docs", href: "/api-ready" },
  ];

  return (
    <section className="min-h-screen flex flex-col font-sans selection:bg-[#F2A93B] selection:text-white bg-white">
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo sesuai bentuk di gambar */}
          <Link href="/" className="flex items-center gap-3">
            {/* <div className="w-10 h-10 relative flex flex-wrap rotate-45">
              <div className="w-5 h-5 bg-[#F2A93B] rounded-tl-sm"></div>
              <div className="w-5 h-5 bg-[#4A90E2] rounded-tr-sm"></div>
              <div className="w-5 h-5 bg-[#8E8E8E] rounded-bl-sm"></div>
              <div className="w-5 h-5 bg-[#7ED321] rounded-br-sm"></div>
            </div> */}
            <Image src="/kross-id.png" alt="Kross ID Logo" width={40} height={40} />
            <div className="flex flex-col -gap-1">
              <span className="text-xl font-black tracking-tighter text-[#4A90E2] leading-none uppercase">
                kross<span className="text-[#F2A93B]">.id</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8E8E8E]">Cross-Community Communication</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-medium text-[#8E8E8E] hover:text-[#4A90E2] transition-colors">
                {item.name}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <button onClick={() => setLang(lang === "ID" ? "EN" : "ID")} className="text-xs font-bold border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
               {lang}
            </button>

            <Link href="/login" className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md">
              Agent Portal
            </Link>
          </div>

          <button className="lg:hidden text-[#4A90E2] text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
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