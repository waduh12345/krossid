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
  MoreHorizontal
} from "lucide-react";

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
    <div className="bg-[#F4F2EE] min-h-screen font-sans">
      
      {/* MAIN LAYOUT */}
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: Filters */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4A90E2]" /> Filter Programs
              </h3>
            </div>
            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Categories</Label>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeCategory === cat 
                        ? "bg-blue-50 text-[#4A90E2] ring-1 ring-blue-100" 
                        : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commission Type */}
              <div>
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Commission Type</Label>
                <div className="space-y-2">
                   {['Flat Based', 'Dynamic %', 'Recurring'].map(type => (
                     <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2]" />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                     </label>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Marketplace Feed */}
        <main className="lg:col-span-6 space-y-4">
          
          {/* Search Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search programs by name or brand..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/20 focus:border-[#4A90E2] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
             <p className="text-xs font-bold text-gray-500">Showing {filteredPrograms.length} active programs</p>
             <div className="flex items-center gap-1 text-xs font-bold text-gray-900 cursor-pointer">
               Sort by: Relevance <MoreHorizontal className="w-3 h-3" />
             </div>
          </div>

          {/* Program Cards */}
          <div className="space-y-4">
            {filteredPrograms.map((prog) => (
              <div key={prog.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="p-5 flex gap-5">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-100">
                    <Image src={prog.image} alt={prog.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-[#4A90E2] uppercase tracking-tighter">{prog.owner}</span>
                          {prog.isVerified && <ShieldCheck className="w-3 h-3 text-[#7ED321]" />}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-[#4A90E2] transition-colors leading-tight mb-1 truncate">
                          {prog.title}
                        </h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                             <Layers className="w-3 h-3" /> {prog.category}
                           </span>
                           <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                             <Star className="w-3 h-3 text-[#F2A93B] fill-[#F2A93B]" /> {prog.rating}
                           </span>
                        </div>
                      </div>
                      
                      {prog.isHot && (
                        <div className="bg-orange-50 text-[#F2A93B] px-2 py-1 rounded-md text-[9px] font-black uppercase border border-orange-100">
                          Hot Deal
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Potential Earn</span>
                        <span className="text-sm font-black text-[#7ED321]">{prog.commission}</span>
                      </div>
                      
                      {/* Link to Detail Page */}
                      <Link href={`/programs/${prog.slug}`} passHref>
                        <button className="flex items-center gap-2 bg-gray-50 text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                          Join Program <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPrograms.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-400 font-bold italic">No programs found for your criteria.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Trending & Stats */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h4 className="font-black text-xs text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F2A93B]" /> Trending Now
            </h4>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0"></div>
                  <div>
                    <p className="text-xs font-black text-gray-800 group-hover:text-[#4A90E2]">High-Ticket SaaS Offer</p>
                    <p className="text-[10px] text-[#7ED321] font-bold">Payouts: IDR 5.2M / mo</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[11px] font-black text-[#4A90E2] border border-blue-50 rounded-lg hover:bg-blue-50 transition-all">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <Zap className="w-6 h-6 text-[#F2A93B] fill-[#F2A93B]" />
             </div>
             <h4 className="font-black text-sm text-gray-900 mb-1">Boost Your Earnings</h4>
             <p className="text-[11px] text-gray-500 mb-4">Complete your profile to unlock premium programs.</p>
             <button className="w-full bg-[#4A90E2] text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
               Complete Profile
             </button>
          </div>
        </aside>

      </div>
    </div>
  );
}

// Simple Label Component for clean UI
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={className}>{children}</span>;
}