"use client";

import { useState } from "react";
import Image from "next/image";

// --- Tipe Data Program (Sesuai Deskripsi Anda) ---
type Program = {
  id: number;
  code: string;
  title: string;
  subTitle: string;
  description: string;
  imageThumb: string; // AVIF
  imageFull: string;  // WebP
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: "Active" | "Draft" | "Closed";
  commissionType: "Flat" | "Dynamic";
  minDomain?: string; // Untuk filter domain korporat
};

export default function ProgramPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // --- Mockup Data Program ---
  const PROGRAMS: Program[] = [
    {
      id: 1,
      code: "BSI-2025-01",
      title: "Corporate Growth Ambassador",
      subTitle: "Exclusive for @bsi.ac.id Network",
      description: "Bergabunglah dalam inisiatif pertumbuhan aset digital terbesar tahun ini. Program ini dirancang khusus untuk civitas dengan domain email @bsi.ac.id. Anda akan mendapatkan akses ke materi pemasaran eksklusif, dashboard real-time, dan sistem pelacakan fraud yang canggih. Komisi dibayarkan secara flat untuk setiap lead yang berhasil divalidasi oleh sistem kami. Pastikan Anda membagikan link melalui channel yang sesuai dengan social capital Anda untuk hasil maksimal.",
      imageThumb: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&format=avif",
      imageFull: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&format=webp",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      durationMonths: 12,
      status: "Active",
      commissionType: "Flat",
      minDomain: "bsi.ac.id"
    },
    {
      id: 2,
      code: "O-CH-NAV",
      title: "Omni-Channel Navigator",
      subTitle: "Public Traffic Harvester",
      description: "Program terbuka untuk publik (Global). Fokus pada pengumpulan trafik dari berbagai platform sosial media seperti TikTok, Instagram, dan WhatsApp. Sistem kami menggunakan alogaritma dinamis untuk menghitung nilai komisi berdasarkan kualitas trafik dan rasio konversi. Dilengkapi dengan API Ready untuk Anda yang ingin mengintegrasikan dashboard ini dengan sistem pribadi Anda. Maksimal deskripsi hingga 2000 kata untuk menjelaskan strategi pemasaran Anda di sini.",
      imageThumb: "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=500&format=avif",
      imageFull: "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=1200&format=webp",
      startDate: "2025-02-01",
      endDate: "2025-08-01",
      durationMonths: 6,
      status: "Active",
      commissionType: "Dynamic"
    }
  ];

  return (
    <div className="bg-[#FAFBFC] min-h-screen pb-20">
      {/* --- HEADER PROGRAM --- */}
      <section className="bg-[#4A90E2] pt-16 pb-32 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
            Affiliate <span className="text-[#F2A93B]">Programs</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto font-light">
            Temukan program yang sesuai dengan jaringan sosial Anda. Gunakan filter untuk menemukan program eksklusif berdasarkan domain email Anda.
          </p>
        </div>
      </section>

      {/* --- FILTER & SEARCH BAR --- */}
      <div className="container mx-auto px-6 -mt-12">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E]"></i>
            <input 
              type="text" 
              placeholder="Cari kode program atau nama..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A90E2] text-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="w-full md:w-auto px-8 py-3 bg-[#4A90E2] text-white rounded-xl font-bold text-sm whitespace-nowrap">
            Filter Domain
          </button>
        </div>
      </div>

      {/* --- PROGRAM GRID --- */}
      <section className="container mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROGRAMS.map((prog) => (
            <div key={prog.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group">
              {/* Image Container with Badges */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image 
                  src={prog.imageThumb} 
                  alt={prog.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${prog.commissionType === 'Flat' ? 'bg-[#7ED321]' : 'bg-[#F2A93B]'}`}>
                    {prog.commissionType} Commission
                  </span>
                  {prog.minDomain && (
                    <span className="bg-[#4A90E2] px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm italic">
                       @{prog.minDomain} Only
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-[#8E8E8E] tracking-widest uppercase">{prog.code}</span>
                  <span className="text-[10px] font-bold text-[#7ED321]"><i className="fas fa-calendar-alt mr-1"></i> {prog.durationMonths} Bulan</span>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 leading-tight group-hover:text-[#4A90E2] transition-colors">
                  {prog.title}
                </h3>
                <p className="text-sm text-[#8E8E8E] mb-6 line-clamp-2 leading-relaxed">
                  {prog.description}
                </p>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#8E8E8E] uppercase font-bold">Start Date</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(prog.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', day: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProgram(prog)}
                    className="w-12 h-12 bg-gray-50 text-[#4A90E2] rounded-full flex items-center justify-center hover:bg-[#F2A93B] hover:text-white transition-all shadow-sm"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROGRAM DETAIL MODAL (Supports 2000 Words) --- */}
      {selectedProgram && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col relative animate-slideUp">
            <button 
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 transition-all"
            >
              <i className="fas fa-times text-lg"></i>
            </button>

            {/* Modal Header Image */}
            <div className="relative h-64 w-full flex-shrink-0">
               <Image src={selectedProgram.imageFull} alt={selectedProgram.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                  <div>
                    <span className="bg-[#F2A93B] px-3 py-1 rounded-md text-[10px] font-black text-white uppercase tracking-widest mb-2 inline-block">Program Detail</span>
                    <h2 className="text-3xl font-black text-white">{selectedProgram.title}</h2>
                  </div>
               </div>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-[#8E8E8E] uppercase mb-1">Duration</p>
                  <p className="font-bold text-[#4A90E2]">{selectedProgram.durationMonths} Months</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-[#8E8E8E] uppercase mb-1">Commission</p>
                  <p className="font-bold text-[#7ED321]">{selectedProgram.commissionType}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-[#8E8E8E] uppercase mb-1">Status</p>
                  <p className="font-bold text-blue-600">{selectedProgram.status}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-[#8E8E8E] uppercase mb-1">Target</p>
                  <p className="font-bold text-gray-700">{selectedProgram.minDomain || 'Global'}</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-[#8E8E8E] leading-relaxed">
                <h4 className="text-[#1A1A1A] font-bold text-lg mb-4 underline decoration-[#F2A93B] decoration-4">Full Description & Strategy</h4>
                {/* Deskripsi mendukung hingga 2000 kata */}
                <p className="whitespace-pre-line">{selectedProgram.description}</p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
                </p>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
              <button className="flex-1 bg-[#4A90E2] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#357ABD] transition-all flex items-center justify-center gap-2">
                <i className="fas fa-link"></i> Generate Referral Link
              </button>
              <button className="flex-1 bg-white border border-gray-200 text-[#8E8E8E] py-4 rounded-xl font-bold hover:bg-gray-100 transition-all">
                Download Marketing Kit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING MOBILE SUPPORT --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 p-2 rounded-2xl shadow-2xl flex justify-around items-center">
           <button className="flex flex-col items-center p-2 text-[#4A90E2]">
              <i className="fas fa-th-large text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Explore</span>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-wallet text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Income</span>
           </button>
           <button className="w-12 h-12 bg-[#F2A93B] rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-[#FAFBFC]">
              <i className="fas fa-plus"></i>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-chart-line text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Analytics</span>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-user-circle text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Profile</span>
           </button>
        </div>
      </div>
    </div>
  );
}