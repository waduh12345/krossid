"use client";

import React from "react";
import Image from "next/image";

const stats = [
  { label: "Alumni PTN", value: "850+", icon: "fa-university" },
  { label: "Lolos PTLN", value: "120+", icon: "fa-plane-departure" },
  { label: "Peningkatan Rapor", value: "95%", icon: "fa-chart-line" },
  { label: "Rating Kepuasan", value: "4.9/5", icon: "fa-star" },
];

const testimonials = [
  {
    id: 1,
    name: "Anindya Putri",
    origin: "SMA Negeri 8 Jakarta",
    target: "Lolos Kedokteran UI",
    message: "Belajar di Qubic bener-bener fun! Tutornya asik banget, materi TKA yang tadinya horor jadi gampang dimengerti. Makasih Qubic udah bantu aku raih mimpi!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    color: "#024BA6"
  },
  {
    id: 2,
    name: "Bagas Pratama",
    origin: "SMA Labschool",
    target: "Waseda University, Japan",
    message: "Program PTLN Qubic jempolan. Gak cuma diajarin SAT/EJU, tapi dibimbing dari nol buat apply beasiswa. Sekarang aku kuliah di Tokyo berkat Qubic!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    color: "#F59E0B"
  },
  {
    id: 3,
    name: "Siti Rahma",
    origin: "SMP IT Al-Azhar",
    target: "Juara Umum Rapor",
    message: "Dulu nilai matematika aku pas-pasan. Semenjak ikut bimbingan reguler Qubic, konsep dasarku jadi kuat. Semester ini aku jadi juara umum di sekolah!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    color: "#D4420C"
  },
  {
    id: 4,
    name: "Kevin Sanjaya",
    origin: "SMA 3 Bandung",
    target: "Lolos Teknik Mesin ITB",
    message: "Aplikasi CBT Qubic ngebantu banget buat simulasi UTBK. Analisis nilainya akurat, jadi aku tau bagian mana yang harus diperbaiki. Sangat worth it!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    color: "#024BA6"
  }
];

export default function TestimoniPage() {
  return (
    <div className="bg-[#FDFCFB] min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <span className="text-[#D4420C] font-bold tracking-widest uppercase text-sm mb-4 inline-block">Success Stories</span>
          <h1 className="text-4xl lg:text-6xl font-black text-[#024BA6] mb-6 leading-tight">
            Cerita Sukses <br/><span className="text-[#F59E0B]">Alumni Qubic</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Mereka telah membuktikannya. Kini giliranmu membangun cita dan meraih masa depan di kampus impian bersama metode Fun Learning.
          </p>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="pb-24 container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#024BA6] p-6 lg:p-10 rounded-[2rem] text-white text-center shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <div className="text-[#F59E0B] text-2xl lg:text-4xl mb-3">
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div className="text-2xl lg:text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-[10px] lg:text-xs uppercase tracking-widest opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- TESTIMONIAL GRID --- */}
      <section className="py-12 container mx-auto px-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonials.map((item) => (
            <div 
              key={item.id} 
              className="break-inside-avoid bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-inner">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-[#024BA6] text-lg leading-tight">{item.name}</h4>
                  <p className="text-xs text-gray-400">{item.origin}</p>
                </div>
              </div>

              {/* Success Badge */}
              <div 
                className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 text-white"
                style={{ backgroundColor: item.color }}
              >
                <i className="fas fa-trophy mr-2"></i> {item.target}
              </div>

              {/* Message */}
              <div className="relative">
                <i className="fas fa-quote-left absolute -top-2 -left-2 text-gray-100 text-4xl -z-0"></i>
                <p className="relative z-10 text-gray-600 leading-relaxed italic font-light">
                  &quot;{item.message}&quot;
                </p>
              </div>

              {/* Stars */}
              <div className="mt-8 flex gap-1 text-[#F59E0B] text-xs">
                {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- VIDEO TESTIMONIAL MOCKUP --- */}
      <section className="py-24 bg-[#024BA6]/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <h2 className="text-3xl lg:text-5xl font-black text-[#024BA6] mb-6">Lihat Langsung Serunya Belajar!</h2>
               <p className="text-gray-600 text-lg mb-8 font-light italic leading-relaxed">
                 &quot;Gak kerasa lagi belajar, suasananya kayak nongkrong produktif bareng kakak-kakak mentor.&quot;
               </p>
               <button className="bg-[#024BA6] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#D4420C] transition-all">
                 <i className="fab fa-youtube text-xl"></i> Tonton di YouTube
               </button>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-video bg-gray-200 rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer">
                <Image 
                   src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071" 
                   alt="Video Thumbnail" 
                   fill 
                   className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#F59E0B] text-white rounded-full flex items-center justify-center text-3xl shadow-glow animate-pulse">
                        <i className="fas fa-play ml-1"></i>
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 text-white font-bold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm">
                   Highlights Belajar Seru @Qubic
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-24 container mx-auto px-6 text-center">
         <div className="bg-gradient-to-br from-[#024BA6] to-[#013576] p-10 lg:p-20 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F59E0B]/20 rounded-full blur-3xl"></div>
            <h2 className="text-3xl lg:text-5xl font-black mb-8 relative z-10">Jadilah Cerita Sukses Berikutnya</h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-12 text-lg font-light relative z-10">
                Jangan biarkan mimpi kuliah di kampus impian hanya jadi angan. Mulai langkahmu hari ini bersama Qubic Bangun Cita.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button className="bg-[#F59E0B] text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-[#024BA6] transition-all shadow-xl">
                    Daftar Sekarang
                </button>
                <button className="border-2 border-white/30 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                    Konsultasi Gratis
                </button>
            </div>
         </div>
      </section>
    </div>
  );
}