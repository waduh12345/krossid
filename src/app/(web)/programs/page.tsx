"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Layers, 
  TrendingUp,
  Star,
  MoreHorizontal,
  Flame,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data Programs
const ALL_PROGRAMS = [
  {
    id: 1,
    slug: "digital-skill-bootcamp-2025",
    owner: "EduTech Global",
    title: "Digital Skill Bootcamp 2025",
    category: "Education",
    commission: "IDR 225.000",
    type: "Flat Based",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
    rating: 4.8,
    isHot: true,
    isVerified: true
  },
  {
    id: 2,
    slug: "electronic-master-affiliate",
    owner: "IndoGadget",
    title: "Electronic Master Affiliate",
    category: "E-Commerce",
    commission: "5% / Sale",
    type: "Dynamic",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500",
    rating: 4.5,
    isHot: false,
    isVerified: true
  },
  {
    id: 3,
    slug: "saas-automation-tool",
    owner: "CloudFlow",
    title: "SaaS Automation Tool",
    category: "Software",
    commission: "IDR 500.000",
    type: "Recurring",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
    rating: 4.9,
    isHot: true,
    isVerified: true
  }
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Education", "E-Commerce", "Software", "Finance", "Health"];

  const filteredPrograms = useMemo(() => {
    return ALL_PROGRAMS.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="relative min-h-screen">
      {/* --- MAIN LAYOUT --- */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT SIDEBAR: Filters */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-black text-xs text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Filter className="w-4 h-4 text-[#367CC0]" /> Filter Hub
              </h3>
            </div>
            <div className="p-6 space-y-8">
              {/* Category Filter */}
              <div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4 block">Main Categories</span>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        activeCategory === cat 
                        ? "bg-[#367CC0] text-white shadow-lg shadow-[#367CC0]/20" 
                        : "text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commission Type */}
              <div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4 block">Income Model</span>
                <div className="space-y-3">
                   {['Flat Based', 'Dynamic %', 'Recurring'].map(type => (
                     <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-lg border border-white/10 bg-white/5 checked:bg-[#DF9B35] transition-all" />
                          <ShieldCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{type}</span>
                     </label>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Marketplace Feed */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Premium Search Header */}
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[32px] p-6 shadow-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                type="text"
                placeholder="Search premium programs or corporate brands..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Inventory: {filteredPrograms.length} Programs</p>
             <div className="flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-[0.2em] cursor-pointer hover:text-[#367CC0] transition-colors">
               Sort: Relevance <MoreHorizontal className="w-3 h-3" />
             </div>
          </div>

          {/* Program Cards */}
          <div className="space-y-6">
            <AnimatePresence>
              {filteredPrograms.map((prog) => (
                <motion.div 
                  key={prog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl group overflow-hidden hover:bg-white/[0.08] transition-all"
                >
                  <div className="p-8 flex flex-col md:flex-row gap-8">
                    {/* Thumbnail within Diamond Frame */}
                    <div className="relative w-28 h-28 shrink-0 mx-auto md:mx-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0] to-[#DF9B35] rounded-3xl rotate-12 opacity-20 group-hover:rotate-45 transition-transform duration-700"></div>
                      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/20 shadow-xl">
                        <Image src={prog.image} alt={prog.title} fill className="object-cover group-hover:scale-125 transition-transform duration-700" />
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-[#367CC0] uppercase tracking-[0.2em]">{prog.owner}</span>
                            {prog.isVerified && <ShieldCheck className="w-4 h-4 text-[#7ED321]" />}
                          </div>
                          <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-[#367CC0] transition-colors">
                            {prog.title}
                          </h3>
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                               <Layers className="w-3 h-3" /> {prog.category}
                             </span>
                             <span className="text-[10px] font-black text-[#DF9B35] uppercase tracking-widest flex items-center gap-1.5">
                               <Star className="w-3 h-3 fill-[#DF9B35]" /> {prog.rating}
                             </span>
                          </div>
                        </div>
                        
                        {prog.isHot && (
                          <div className="bg-[#DF9B35]/10 text-[#DF9B35] px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-[#DF9B35]/20 flex items-center gap-2">
                            <Flame size={12} /> Hot Deal
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                        <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Potential Earn</span>
                          <span className="text-lg font-black text-[#7ED321]">{prog.commission}</span>
                        </div>
                        
                        <Link href={`/programs/${prog.slug}`} className="w-full sm:w-auto">
                          <button className="w-full flex items-center justify-center gap-3 bg-[#367CC0] text-white hover:bg-[#2d6699] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#367CC0]/30 transition-all hover:scale-105 active:scale-95">
                            Authorize Access <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredPrograms.length === 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-dashed border-white/10 rounded-[40px] p-20 text-center">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] italic">No Authorized Assets Found</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Trending & Boosting */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h4 className="font-black text-xs text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-[#DF9B35]" /> Market Pulse
            </h4>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl shrink-0 flex items-center justify-center font-black text-[#367CC0]">
                    {i === 1 ? 'S' : 'F'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white/80 group-hover:text-[#367CC0] leading-tight">High-Ticket Enterprise SaaS</p>
                    <p className="text-[10px] text-[#7ED321] font-black mt-1 uppercase tracking-widest">IDR 5.2M / Sale</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border border-white/5 rounded-2xl hover:bg-white/5 hover:text-white transition-all">
              Market Intelligence
            </button>
          </div>

          {/* Secure Boost Card with Concave Notch */}
          <div 
            className="bg-[#0a0a0a] p-8 rounded-[40px] relative overflow-hidden shadow-2xl border border-white/5"
            style={{ WebkitMaskImage: 'radial-gradient(circle 50px at 100% 0%, transparent 100%, black 101%)' }}
          >
             <div className="relative z-10">
                <Zap className="text-[#DF9B35] mb-4 fill-[#DF9B35]" size={32} />
                <h4 className="font-black text-xl text-white leading-tight mb-3 tracking-tighter">Maximize Your<br />Asset Reach</h4>
                <p className="text-[11px] text-white/40 leading-relaxed italic mb-8">"Complete your corporate profile to unlock restricted high-tier programs."</p>
                <button className="w-full bg-[#DF9B35] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#DF9B35]/20 hover:brightness-110 transition-all">
                  Get Verified
                </button>
             </div>
             {/* Decorative Background Icon */}
             <Award className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/[0.03] -rotate-12 pointer-events-none" />
          </div>
        </aside>

      </div>
    </div>
  );
}