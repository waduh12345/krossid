"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Users, TrendingUp, ShieldCheck, ArrowRight, Search,
  Zap, Bookmark, UserPlus, Award, Target, Loader2, Clock, Eye,
  Heart, Share2, Sparkles, Trophy, Settings
} from "lucide-react";

// API Services
import { useGetTopProgramsQuery, useGetTopSalesQuery } from "@/services/public/top.service";
import { useGetPublicProgramsQuery } from "@/services/public/program.service";

// --- UTILS ---
const REWARD_BADGES = [
  { label: "🔥 Hot Deal", color: "from-orange-500 to-red-500", textColor: "text-orange-100" },
  { label: "⚡ Fast Payout", color: "from-yellow-400 to-orange-500", textColor: "text-yellow-100" },
  { label: "🏆 Top Rated", color: "from-purple-500 to-pink-500", textColor: "text-purple-100" },
];

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${Math.floor(diffInHours / 24)}d`;
}

// --- SUB-COMPONENTS (Defined outside to prevent re-mount bugs) ---

const SidebarLeft = ({ session }: { session: any }) => (
  <aside className="hidden lg:block lg:col-span-3 sticky top-30 h-fit space-y-6">
    {session ? (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="h-20 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] opacity-80"></div>
        <div className="px-6 pb-6 text-center">
          <div className="relative w-20 h-20 -mt-10 mx-auto group">
            <div className="absolute inset-0 bg-[#367CC0] rounded-2xl rotate-45"></div>
            <div className="absolute inset-1 bg-[#0f172a] rounded-2xl rotate-45 overflow-hidden flex items-center justify-center">
              <Image 
                src={session.user?.image || "https://ui-avatars.com/api/?name=" + session.user?.name} 
                alt="Profile" width={80} height={80} className="-rotate-45 scale-125" 
              />
            </div>
          </div>
          <h3 className="mt-4 font-black text-xl text-white tracking-tight">{session.user?.name}</h3>
          <p className="text-[#367CC0] text-[10px] font-black uppercase tracking-[0.2em]">Certified Affiliator</p>
        </div>
      </div>
    ) : (
      <div className="bg-gradient-to-br from-[#367CC0]/20 to-[#DF9B35]/20 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 text-center">
        <UserPlus size={40} className="mx-auto text-white mb-4" />
        <h3 className="font-black text-white mb-4">Join Network</h3>
        <Link href="/signin" className="block w-full bg-[#367CC0] text-white py-3 rounded-xl font-bold text-sm">Login</Link>
      </div>
    )}

    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-4 space-y-2">
      {[
        { label: "My Programs", icon: Briefcase, color: "#367CC0" },
        { label: "Network Group", icon: Users, color: "#DF9B35" },
        { label: "Saved Items", icon: Bookmark, color: "#7ED321" },
      ].map((item, i) => (
        <button key={i} className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/5 transition-all group">
          <item.icon size={18} style={{ color: item.color }} />
          <span className="text-sm font-bold text-white/70 group-hover:text-white">{item.label}</span>
        </button>
      ))}
    </div>
  </aside>
);

const SidebarRight = ({ liveActivity, featuredProgram }: any) => (
  <aside className="hidden lg:block lg:col-span-3 sticky top-30 h-fit space-y-6">
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl">
      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
        <TrendingUp className="text-[#7ED321]" size={16} /> Live Pulse
      </h4>
      <div className="space-y-6">
        {liveActivity.map((activity: any) => (
          <div key={activity.id} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-xs font-black text-[#367CC0]">
              {activity.user.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/70 font-bold leading-tight">{activity.user}</p>
              <p className="text-xs font-black text-[#7ED321] mt-1">{activity.amount}</p>
              <p className="text-[9px] text-white/20 uppercase font-black mt-1">{activity.time} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-[#0a0a0a] p-8 rounded-[40px] relative overflow-hidden border border-white/5 shadow-2xl">
      <Zap className="text-[#DF9B35] mb-4" size={32} />
      <h4 className="text-xl font-black text-white leading-tight mb-4">{featuredProgram.title}</h4>
      <p className="text-white/40 text-xs italic mb-8">"{featuredProgram.description}"</p>
      <button className="w-full bg-[#DF9B35] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
        List Your Program
      </button>
    </div>
  </aside>
);

// --- MAIN COMPONENT ---
export default function AffiliateHome() {
  const { data: session } = useSession();
  
  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [likedPrograms, setLikedPrograms] = useState<Set<number>>(new Set());
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: programsResponse, isLoading, isFetching } = useGetPublicProgramsQuery({
    paginate: 5,
    page: currentPage,
  });

  const { data: salesResponse } = useGetTopSalesQuery({ paginate: 5 });
  const { data: topPrograms } = useGetTopProgramsQuery({ paginate: 5 });

  // Infinite Scroll Logic: Append data when programsResponse changes
  useEffect(() => {
    if (programsResponse?.data) {
      const newItems = programsResponse.data;
      
      setAllPrograms(prev => {
        // Prevent duplicates using a Map or filtering by ID
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newItems.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...filteredNew];
      });

      // Check if this is the last page
      if (programsResponse.current_page >= programsResponse.last_page) {
        setHasMore(false);
      }
    }
  }, [programsResponse]);

  // Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching && !isLoading) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetching, isLoading]);

  // Memoized Activity Data
  const liveActivity = useMemo(() => {
    return (salesResponse?.data || []).map((sale: any, i: number) => ({
      id: sale.id || i,
      user: sale.agent_name || "Anonymous",
      amount: `Rp ${(parseInt(sale.total_commission || 0)).toLocaleString()}`,
      time: sale.created_at ? getTimeAgo(sale.created_at) : "1m"
    }));
  }, [salesResponse]);

  const featuredProgram = useMemo(() => ({
    title: topPrograms?.data?.[0]?.title || "Enterprise Ready",
    description: topPrograms?.data?.[0]?.description || "Scale your business with our top performing affiliate network."
  }), [topPrograms]);

  const toggleLike = (id: number) => {
    setLikedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-[#367CC0]/30">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR - STICKY */}
          <SidebarLeft session={session} />

          {/* MAIN FEED - SCROLLABLE */}
          <main className="col-span-1 lg:col-span-6 space-y-8">
            {/* Search Box */}
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[32px] p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <Search className="text-white/40" size={20} />
                <input 
                  placeholder="Search programs..." 
                  className="w-full bg-transparent border-none text-white placeholder:text-white/20 text-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Program List */}
            <div className="space-y-8">
              {allPrograms.map((prog, index) => (
                <motion.div 
                  key={prog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden group hover:bg-white/[0.08] transition-all"
                >
                  <div className="relative h-56 w-full">
                    <Image 
                      src={prog.avif || prog.original || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} 
                      alt={prog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-[#367CC0] px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                      {index % 2 === 0 ? "🔥 Hot" : "⚡ Verified"}
                    </div>

                    <button 
                      onClick={() => toggleLike(prog.id)}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${likedPrograms.has(prog.id) ? 'bg-red-500' : 'bg-black/20 backdrop-blur-md'}`}
                    >
                      <Heart size={18} fill={likedPrograms.has(prog.id) ? "white" : "none"} className="text-white" />
                    </button>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{prog.program_category_name || "Service"}</span>
                      <div className="flex items-center gap-2 bg-[#7ED321]/10 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-[#7ED321]" />
                        <span className="text-xs font-black text-[#7ED321]">
                          {prog.commission ? `${prog.commission}%` : `Rp ${prog.nominal?.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight mb-4 group-hover:text-[#367CC0] transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-8">{prog.description}</p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[#7ED321]">
                        <ShieldCheck size={18} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Verified</span>
                      </div>
                      <Link 
                        href={`/programs/${prog.id}`}
                        className="bg-gradient-to-r from-[#367CC0] to-[#5B9BD5] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#367CC0]/30 hover:scale-105 transition-all flex items-center gap-2"
                      >
                        Join Program <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* INFINITE SCROLL LOADER */}
            <div ref={loadMoreRef} className="py-12 flex flex-col items-center justify-center">
              {isFetching && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-[#367CC0]" size={40} />
                  <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Loading Content</p>
                </div>
              )}
              {!hasMore && allPrograms.length > 0 && (
                <div className="bg-white/5 px-8 py-4 rounded-full border border-white/10 flex items-center gap-3">
                  <Trophy className="text-[#DF9B35]" size={20} />
                  <span className="text-xs font-bold text-white/40">You've reached the end of the galaxy!</span>
                </div>
              )}
            </div>
          </main>

          {/* RIGHT SIDEBAR - STICKY */}
          <SidebarRight liveActivity={liveActivity} featuredProgram={featuredProgram} />

        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}