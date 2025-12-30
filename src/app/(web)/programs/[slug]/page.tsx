"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Share2, 
  Star, 
  Users, 
  Zap, 
  Target, 
  CheckCircle,
  CreditCard,
  Rocket,
  Copy,
  ExternalLink,
  BarChart3,
  Download
} from "lucide-react";
import Link from "next/link";
import AffiliateRegisterModal from "@/components/affiliate-register-modal";
import Swal from "sweetalert2";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProgramDetail() {

  const [showModal, setShowModal] = useState(false);
  const [isJoinedAsAffiliate, setIsJoinedAsAffiliate] = useState(false); 

  const referralLink = "https://affiliatecore.com/ref/nadi-techno-01";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      text: 'Sekarang Anda bisa membagikannya di media sosial.',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  // Simulasi Data Program yang dipilih
  const program = {
    title: "Digital Skill Bootcamp 2025",
    owner: "EduTech Global",
    category: "Professional Development",
    rating: 4.8,
    reviews: 124,
    participants: "1,200+",
    price: "IDR 1.500.000",
    commission: "15% (IDR 225k) per sale",
    description: "Program intensif 3 bulan untuk menguasai Fullstack Development dengan kurikulum yang disesuaikan dengan kebutuhan industri startup global.",
    benefits: [
      "Sertifikat Kompetensi Internasional",
      "Akses Lifetime ke Modul Pembelajaran",
      "Sesi Mentoring 1-on-1",
      "Akses ke Job Connector"
    ],
    affiliateRequirements: [
      "Memiliki minimal 500 followers di Sosmed",
      "Aktif di komunitas edukasi/teknologi",
      "Paham dasar-dasar digital marketing"
    ]
  };

  return (
    <div className="bg-[#F4F2EE] min-h-screen pb-12 font-sans">
      {/* --- HEADER NAV --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-500 hover:text-[#4A90E2] font-bold text-sm transition-all">
            <ChevronLeft className="w-4 h-4" /> Back to Marketplace
          </button>
          <div className="flex gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: CONTENT (LinkedIn Post/Article Style) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Banner Image */}
              <div className="h-64 relative bg-gray-200">
                <Image 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200" 
                  alt="Program Banner" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-2 border border-white">
                  <span className="w-2 h-2 bg-[#7ED321] rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-[#4A90E2] uppercase tracking-widest">Active Program</span>
                </div>
              </div>

              {/* Program Identity */}
              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[#4A90E2] font-black text-xs uppercase tracking-widest mb-1">{program.category}</p>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">{program.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Star className="w-4 h-4 text-[#F2A93B] fill-[#F2A93B]" /> {program.rating} 
                        <span className="text-gray-400 font-medium">({program.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" /> {program.participants} <span className="text-gray-400 font-medium">Students</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-[#4A90E2] rounded-lg flex items-center justify-center text-white font-black italic">E</div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Created by</p>
                      <p className="text-sm font-black text-gray-900">{program.owner}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">About this program</h4>
                  <p>{program.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#7ED321]" /> Student Benefits
                    </h4>
                    <ul className="space-y-3">
                      {program.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5"></span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#F2A93B]" /> Affiliate Guidelines
                    </h4>
                    <ul className="space-y-3">
                      {program.affiliateRequirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium italic">
                          <span className="w-1.5 h-1.5 border border-[#F2A93B] rounded-full mt-1.5"></span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: DUAL ACTION CARDS --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD 1: For Students/Users */}
            <div className="bg-white rounded-2xl border-2 border-transparent shadow-xl p-6 ring-1 ring-gray-100 relative overflow-hidden group hover:border-[#4A90E2] transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-all"></div>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Join as Participant
              </h3>
              <div className="mb-6">
                <span className="text-3xl font-black text-gray-900">{program.price}</span>
                <p className="text-xs text-gray-500 font-medium mt-1">One-time payment for full access</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-600">
                   <ShieldCheck className="w-4 h-4 text-[#7ED321]" /> 100% Secure Transaction
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-600">
                   <CheckCircle className="w-4 h-4 text-[#7ED321]" /> Lifetime Support Access
                </li>
              </ul>
              <Link href="/checkout" className="w-full bg-[#4A90E2] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3" >
                <CreditCard className="w-5 h-5" /> Buy & Join Program
              </Link>
            </div>

            {/* CARD 2: Affiliate Control Panel (POV: Sudah Login & Join) */}
            {!isJoinedAsAffiliate ? (
              /* Tampilan Jika Belum Join (Sama seperti sebelumnya) */
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              {/* Highlight Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2A93B]/20 rounded-full blur-3xl group-hover:bg-[#F2A93B]/30 transition-all"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-[#F2A93B] uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Become an Affiliate
                  </h3>
                  <div className="bg-[#F2A93B] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">High Earning</div>
                </div>
                
                <div className="mb-6">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Commission Potential</p>
                  <span className="text-2xl font-black text-white">{program.commission}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Rocket className="w-4 h-4 text-[#F2A93B]" />
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">Dapatkan **Marketing Kit** (Banner & Copywriting) gratis setelah pendaftaran disetujui.</p>
                  </div>
                </div>

                <button className="w-full bg-white text-gray-900 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#F2A93B] hover:text-white transition-all flex items-center justify-center gap-3" onClick={() => setShowModal(true)}>
                  Register as Affiliate
                </button>
                
                <AffiliateRegisterModal 
                  isOpen={showModal} 
                  onClose={() => setShowModal(false)} 
                  programTitle="Digital Skill Bootcamp 2025" 
                />
                <p className="text-center text-[10px] text-gray-500 font-bold mt-4 uppercase tracking-tighter">Subject to Owner Approval</p>
              </div>
            </div>
            ) : (
              /* Tampilan Jika SUDAH Join (Marketing Dashboard) */
              <div className="bg-white rounded-2xl border-2 border-[#F2A93B] shadow-xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-orange-50 text-[#F2A93B] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-orange-100">
                    Affiliate Active
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>

                <div className="mb-6">
                  <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Your Referral Link</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-600 truncate">
                      {referralLink}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="bg-[#F2A93B] text-white p-2 rounded-lg hover:bg-[#d89632] transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Total Clicks</p>
                      <p className="text-lg font-black text-gray-900">142</p>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Earnings</p>
                      <p className="text-lg font-black text-[#7ED321]">IDR 450k</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Share to Networks</Label>
                  <div className="flex gap-2">
                    {/* WhatsApp */}
                    <Button className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </Button>
                    {/* Facebook */}
                    <Button className="flex-1 bg-[#1877F2] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </Button>
                    {/* TikTok */}
                    <Button className="flex-1 bg-black text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                    </Button>
                    {/* Instagram */}
                    <Button className="flex-1 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                    <Download className="w-4 h-4" /> Download Marketing Kit
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-3 text-[#4A90E2] font-black text-xs uppercase hover:bg-blue-50 rounded-xl transition-all">
                    View Full Report <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Stats / Proof Sidebar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Program Vitality</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-500">Avg. Payout Time</span>
                    <span className="text-sm font-black text-gray-900">24 Hours</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#7ED321] h-full w-[85%]"></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-500">Conv. Rate</span>
                    <span className="text-sm font-black text-gray-900">12.4%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#4A90E2] h-full w-[60%]"></div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}