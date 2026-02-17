"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Swal from "sweetalert2";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  Loader2,
  Heart,
  Filter,
  Crown,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Star,
  X,
  Search,
  Mail,
  RefreshCw,
  KeyRound,
} from "lucide-react";

/* ================== UI ================== */
import { Input } from "@/components/ui/input";

/* ================== API ================== */
import { useRegisterMutation, useResendOtpMutation, useValidateEmailOtpMutation } from "@/services/auth.service";
import { useGetTopProgramsQuery } from "@/services/public/top.service";
import { useGetPublicProgramsQuery } from "@/services/public/program.service";
import { useGetPublicCategoriesListQuery } from "@/services/programs/categories.service";
import { useI18n } from "@/contexts/i18n-context";

/* ================== SIDEBAR LEFT ================== */
type SidebarLeftProps = {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
};

const SidebarLeft = ({
  categories,
  activeCategory,
  setActiveCategory,
}: SidebarLeftProps) => {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-6">
          <Filter size={14} /> {t.home.filter}
        </h3>

      <div className="space-y-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "text-white/50 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoggedIn && (
        <div className="mt-6 space-y-2">
          <Link href="/my-account?tab=affiliate" className="w-full bg-white text-blue-600 font-black py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition">My Programs</Link>
        </div>
      )}
    </div>
  </aside>
  );
};

/* ================== SIDEBAR RIGHT ================== */
const SidebarRight = ({
  topPrograms,
  onRegister,
}: {
  topPrograms: any[];
  onRegister: () => void;
}) => {
  const { t } = useI18n();
  return (
    <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-6">
          <Crown size={14} className="text-yellow-400" /> {t.home.topPrograms}
        </h4>

        <div className="space-y-4">
          {topPrograms.length > 0 ? (
            topPrograms.slice(0, 3).map((prog: any, index: number) => (
              <Link
                key={prog.id || index}
                href={`/programs/${prog.program_id || prog.program?.id || prog.id}`}
                className="flex gap-3 items-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 font-black flex items-center justify-center">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white group-hover:text-blue-400">
                    {prog.program?.title || prog.title || "Program"}
                  </p>
                  <p className="text-xs text-white/40">
                    {prog.program?.sub_title || prog.sub_title || "General"}
                  </p>
                </div>
                <ArrowRight size={14} className="text-white/30" />
              </Link>
            ))
          ) : (
            <div className="text-white/40 text-xs text-center py-4">
              {t.home.noTopPrograms}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white">
        <h4 className="text-lg font-black mb-2">{t.home.becomeOwner}</h4>
        <p className="text-sm text-white/90 mb-6">
          {t.home.becomeOwnerDesc}
        </p>
        <button
          onClick={onRegister}
          className="w-full bg-white text-blue-600 font-black py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition"
        >
          <PlusCircle size={16} /> {t.home.registerAsOwner}
        </button>
      </div>
    </aside>
  );
};

/* ================== DUMMY DATA ================== */
const DUMMY_PROGRAMS = [
  {
    id: 1,
    title: "Program Affiliate Premium",
    sub_title: "E-commerce & Digital Products",
    description: "Dapatkan komisi hingga 30% dari setiap penjualan produk digital. Program ini cocok untuk Anda yang ingin menghasilkan pendapatan pasif.",
    program_category_name: "Digital Products",
    avif: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    original: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    commission: 30,
    status: true,
  },
  {
    id: 2,
    title: "Online Course Affiliate",
    sub_title: "Education & Learning",
    description: "Promosikan kursus online berkualitas tinggi dan dapatkan komisi 25% dari setiap pendaftaran. Materi lengkap dan terstruktur.",
    program_category_name: "Education",
    avif: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    original: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    commission: 25,
    status: true,
  },
  {
    id: 3,
    title: "Software Subscription",
    sub_title: "SaaS & Technology",
    description: "Affiliate program untuk software subscription dengan komisi bulanan berulang. Dapatkan pendapatan stabil setiap bulan.",
    program_category_name: "Technology",
    avif: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    original: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    commission: 20,
    status: true,
  },
  {
    id: 4,
    title: "E-book & Digital Books",
    sub_title: "Publishing & Books",
    description: "Promosikan e-book dan dapatkan komisi 40% dari setiap pembelian. Koleksi lengkap buku digital untuk berbagai kategori.",
    program_category_name: "Publishing",
    avif: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
    original: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
    commission: 40,
    status: true,
  },
  {
    id: 5,
    title: "Webinar & Workshop",
    sub_title: "Events & Training",
    description: "Affiliate program untuk webinar dan workshop online. Dapatkan komisi dari setiap peserta yang mendaftar melalui link Anda.",
    program_category_name: "Events",
    avif: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    original: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    commission: 35,
    status: true,
  },
];

const DUMMY_TOP_PROGRAMS = [
  {
    id: 1,
    title: "Program Affiliate Premium",
    sub_title: "E-commerce & Digital Products",
  },
  {
    id: 2,
    title: "Online Course Affiliate",
    sub_title: "Education & Learning",
  },
  {
    id: 3,
    title: "Software Subscription",
    sub_title: "SaaS & Technology",
  },
];

const DUMMY_CATEGORIES = [
  "All",
  "Digital Products",
  "Education",
  "Technology",
  "Publishing",
  "Events",
];

/* ================== MAIN PAGE ================== */
export default function AffiliateHome() {
  // const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [useDummyData, setUseDummyData] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useGetPublicCategoriesListQuery(
    {
      paginate: 20,
      page: 1,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState(t.home.all);
  const [page, setPage] = useState(1);
  const [programs, setPrograms] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get search from URL params
  const searchQuery = searchParams.get("search") || "";

  // Open register modal when coming from pricing (e.g. /home?openRegister=1)
  useEffect(() => {
    if (searchParams.get("openRegister") === "1") {
      setShowRegisterModal(true);
    }
  }, [searchParams]);

  const { data, isLoading, isFetching, isError, refetch } = useGetPublicProgramsQuery(
    {
      paginate: 5,
      page,
      search: searchQuery.length >= 2 ? searchQuery : undefined,
    },
    { 
      skip: useDummyData,
      refetchOnMountOrArgChange: true,
    }
  );
  
  // Handle focus event - refresh when window gains focus (for back navigation)
  useEffect(() => {
    const handleFocus = () => {
      if (!useDummyData && page === 1) {
        refetch();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [useDummyData, page, refetch]);
  
  // Handle popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (!useDummyData) {
        setPrograms([]);
        setPage(1);
        setHasMore(true);
        setTimeout(() => refetch(), 50);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [useDummyData, refetch]);

  // Clear search handler
  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const newUrl = params.toString() ? `/home?${params.toString()}` : "/home";
    router.push(newUrl, { scroll: false });
  };

  const { data: topProgramsRes, isLoading: topProgramsLoading } = useGetTopProgramsQuery(
    { paginate: 3 },
    { 
      skip: useDummyData,
      refetchOnMountOrArgChange: true,
    }
  );

  // Use dummy data if API fails (but not when search returns empty)
  useEffect(() => {
    // Only fallback to dummy data if there's an API error, not when search returns empty
    if (isError && !searchQuery) {
      setUseDummyData(true);
      setPrograms(DUMMY_PROGRAMS);
      setHasMore(false);
    }
  }, [isError, searchQuery]);

  /* ===== sync programs with data ===== */
  useEffect(() => {
    if (useDummyData) return;
    if (!data?.data) return;
    
    // For page 1, always replace programs entirely
    if (page === 1 || data.current_page === 1) {
      setPrograms(data.data);
    } else {
      // For subsequent pages, append only new programs
      setPrograms((prev) => {
        // If prev is empty (after navigation), just set the data
        if (prev.length === 0) {
          return data.data;
        }
        const ids = new Set(prev.map((p) => p.id));
        const newItems = data.data.filter((p: any) => !ids.has(p.id));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
    
    setHasMore(data.current_page < data.last_page);
  }, [data, useDummyData, page]);

  /* ===== reset programs when category or search changes ===== */
  const prevCategoryRef = useRef(activeCategory);
  const prevSearchRef = useRef(searchQuery);
  
  useEffect(() => {
    // Only reset when category or search actually changes (not on mount)
    const categoryChanged = prevCategoryRef.current !== activeCategory;
    const searchChanged = prevSearchRef.current !== searchQuery;
    
    if (!categoryChanged && !searchChanged) {
      return;
    }
    
    prevCategoryRef.current = activeCategory;
    prevSearchRef.current = searchQuery;
    
    if (useDummyData) {
      // Filter dummy data by search
      if (searchQuery.length >= 2) {
        const filtered = DUMMY_PROGRAMS.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.program_category_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setPrograms(filtered);
      } else {
        setPrograms(DUMMY_PROGRAMS);
      }
      setHasMore(false);
    } else {
      setPrograms([]);
      setPage(1);
      setHasMore(true);
    }
  }, [activeCategory, useDummyData, searchQuery]);

  /* ===== infinite scroll ===== */
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isFetching && !isLoading) {
        setPage((p) => p + 1);
      }
    },
    [hasMore, isFetching, isLoading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: "200px",
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [onIntersect]);

  /* ===== lock scroll modal ===== */
  useEffect(() => {
    document.body.style.overflow = showRegisterModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRegisterModal]);

  const filteredPrograms = useMemo(() => {
    // Use data.data as fallback when programs is empty but data is available
    const sourceData = programs.length > 0 ? programs : (data?.data || []);
    
    if (activeCategory === t.home.all || activeCategory === "All" || activeCategory === "Semua") {
      return sourceData;
    }
    return sourceData.filter(
      (p: any) => p.program_category_name === activeCategory
    );
  }, [programs, data?.data, activeCategory, t]);

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SidebarLeft
            categories={
              useDummyData
                ? [t.home.all, ...DUMMY_CATEGORIES.filter(c => c !== "All")]
                : categories?.data
                ? [t.home.all, ...categories.data.map((c: any) => c.name)]
                : [t.home.all]
            }
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          {/* MAIN */}
          <main className="lg:col-span-6 space-y-6">
            {/* Search Indicator */}
            {searchQuery.length >= 2 && (
              <div className="bg-gradient-to-r from-[#367CC0]/20 to-[#DF9B35]/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#367CC0]/30 flex items-center justify-center">
                      <Search size={18} className="text-[#367CC0]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">
                        {t.search?.searchingFor || "Searching for"}
                      </p>
                      <p className="text-lg font-black text-white">
                        &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isLoading && data?.total !== undefined && (
                      <span className="text-xs text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
                        {data.total} {t.search?.resultsFound || "results found"}
                      </span>
                    )}
                    <button
                      onClick={handleClearSearch}
                      className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
                    >
                      <X size={14} />
                      {t.search?.clearSearch || "Clear search"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !useDummyData && programs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-white/50 text-sm">{t.home.loadingPrograms}</p>
              </div>
            )}

            {/* Empty State - No Results for Search */}
            {!isLoading && filteredPrograms.length === 0 && searchQuery.length >= 2 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <Search className="text-white/30 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-black text-white mb-2">
                  {t.search?.noResults || "No programs found for"} &quot;{searchQuery}&quot;
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  {t.search?.tryDifferent || "Try searching with different keywords"}
                </p>
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#367CC0] hover:text-[#5da2e6] transition-colors"
                >
                  <X size={16} />
                  {t.search?.clearSearch || "Clear search"}
                </button>
              </div>
            )}

            {/* Empty State - General */}
            {!isLoading && filteredPrograms.length === 0 && !useDummyData && searchQuery.length < 2 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <Sparkles className="text-yellow-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-black text-white mb-2">
                  {t.home.noProgramsFound}
                </h3>
                <p className="text-white/50 text-sm">
                  {t.home.noProgramsDesc}
                </p>
              </div>
            )}

            {/* Programs List */}
            {filteredPrograms.length > 0 && (
              <>
                {filteredPrograms.map((prog: any) => (
                  <motion.div
                    key={prog.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-colors"
                  >
                    <Link href={`/programs/${prog.id}`}>
                      <div className="relative h-52">
                        <Image
                          src={
                            prog.avif ||
                            prog.original ||
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                          }
                          alt={prog.title || "Program image"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleLike(prog.id);
                          }}
                          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                            liked.has(prog.id)
                              ? "bg-red-500"
                              : "bg-black/40 hover:bg-black/60"
                          }`}
                        >
                          <Heart
                            fill={liked.has(prog.id) ? "white" : "none"}
                            className="text-white"
                            size={18}
                          />
                        </button>
                        {prog.commission && (
                          <div className="absolute bottom-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-white text-xs font-black">
                              {prog.commission}% {t.home.commission}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-xl font-black text-white flex-1">
                            {prog.title}
                          </h3>
                        </div>
                        {prog.sub_title && (
                          <p className="text-xs text-blue-400 font-bold mb-2">
                            {prog.sub_title}
                          </p>
                        )}
                        <p className="text-sm text-white/50 line-clamp-2 mt-2">
                          {prog.description || "No description available"}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                            <ShieldCheck size={14} /> {t.home.verified}
                          </span>
                          <span className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 transition-colors">
                            {t.home.join} <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {isFetching && !useDummyData && (
                    <Loader2 className="animate-spin text-blue-500" size={28} />
                  )}
                  {!hasMore && filteredPrograms.length > 0 && (
                    <div className="text-white/40 text-xs flex gap-2 items-center">
                      <Trophy className="text-yellow-400" size={14} />
                      {t.home.endOfContent}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          <SidebarRight
            topPrograms={
              useDummyData
                ? DUMMY_TOP_PROGRAMS
                : topProgramsRes?.data || []
            }
            onRegister={() => setShowRegisterModal(true)}
          />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowRegisterModal(false)}
          />
          <div className="relative z-10 w-full max-w-xl bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-white/10 rounded-3xl p-8" style={{ marginTop: "100px" }}>
            <ProductOwnerRegisterModal
              onClose={() => setShowRegisterModal(false)}
              selectedPlan={searchParams.get("plan") || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== REGISTER MODAL ================== */
const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
  freeTrial: "Free Trial",
};

function ProductOwnerRegisterModal({
  onClose,
  selectedPlan,
}: {
  onClose: () => void;
  selectedPlan?: string;
}) {
  const router = useRouter();
  const { t, language } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const showCompanyField = selectedPlan === "business" || selectedPlan === "enterprise";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    company_name: "",
  });

  const [register] = useRegisterMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [validateEmailOtp, { isLoading: isValidating }] = useValidateEmailOtpMutation();

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation - Indonesian format (08xx, 62xx, +62xx)
  const isValidPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Format phone number for display
  const formatPhoneDisplay = (value: string) => {
    // Only allow numbers and + at start
    return value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const formattedValue = formatPhoneDisplay(value);
      setForm({ ...form, [name]: formattedValue });
      if (errors.phone) setErrors({ ...errors, phone: "" });
    } else if (name === "email") {
      setForm({ ...form, [name]: value });
      if (errors.email) setErrors({ ...errors, email: "" });
    } else if (name === "company_name") {
      setForm({ ...form, [name]: value });
      if (errors.company_name) setErrors({ ...errors, company_name: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const newErrors = { email: "", phone: "", company_name: "" };
    let isValid = true;

    if (!isValidEmail(form.email)) {
      newErrors.email = t.home.registerModal.invalidEmailText;
      isValid = false;
    }

    if (!isValidPhone(form.phone)) {
      newErrors.phone = t.home.registerModal.invalidPhoneText;
      isValid = false;
    }

    if (selectedPlan === "enterprise" && (!form.company_name || !form.company_name.trim())) {
      newErrors.company_name = t.home.registerModal.companyNameRequired ?? "Company name is required for Enterprise.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle step 1 continue
  const handleStep1Continue = () => {
    if (!validateStep1()) {
      return;
    }
    setStep(2);
  };

  // Handle registration (step 2 -> step 3)
  const handleRegister = async () => {
    if (form.password !== form.password_confirmation) {
      Swal.fire({
        icon: "error",
        title: t.home.registerModal.passwordMismatchTitle,
        text: t.home.registerModal.passwordMismatchText,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (form.password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: t.home.registerModal.passwordShortTitle,
        text: t.home.registerModal.passwordShortText,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: "owner",
        ...(selectedPlan && { plan: selectedPlan }),
        ...(showCompanyField && form.company_name?.trim() && { company_name: form.company_name.trim() }),
      }).unwrap();
      
      // Store token for OTP verification
      if (result?.data?.token) {
        setAuthToken(result.data.token);
      }
      
      // Move to OTP step
      setStep(3);
      setResendCountdown(60); // Start 60 second countdown
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.home.registerModal.registerFailedTitle,
        text: err?.data?.message || t.home.registerModal.registerFailedText,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP verification and auto-login
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    try {
      // Validate OTP with email
      await validateEmailOtp({ email: form.email, otp }).unwrap();
      
      // Show success message briefly
      Swal.fire({
        icon: "success",
        title: t.home.registerModal.registerSuccessTitle,
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="margin-bottom: 10px; font-size: 16px;">${t.home.registerModal.registerSuccessText}</p>
            <p style="color: #6b7280; font-size: 14px;">${t.home.registerModal.loggingIn}</p>
          </div>
        `,
        confirmButtonColor: "#10b981",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
      });

      // Auto-login with credentials
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (loginRes?.ok) {
        // Wait for session to update, then redirect based on role
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSessionAndRedirect = async () => {
          const session = await getSession();
          
          if (session?.user?.roles && Array.isArray(session.user.roles) && session.user.roles.length > 0) {
            const firstRole = session.user.roles[0];
            const userRole = typeof firstRole === "object" && "name" in firstRole 
              ? firstRole.name 
              : typeof firstRole === "string" 
              ? firstRole 
              : null;

            onClose();
            
            // Owner role goes to CMS dashboard
            if (userRole === "superadmin" || userRole === "owner") {
              router.push("/cms");
            } else {
              router.push("/home");
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkSessionAndRedirect, 200);
          } else {
            onClose();
            router.push("/home");
          }
        };

        setTimeout(checkSessionAndRedirect, 100);
      } else {
        // Login failed after verification, redirect to signin
        onClose();
        router.push("/signin");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.home.registerModal.otpInvalid,
        text: err?.data?.message || t.home.registerModal.otpInvalidText,
        confirmButtonColor: "#ef4444",
      });
      setOtp("");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!authToken || resendCountdown > 0 || isResending) return;

    try {
      await resendOtp(authToken).unwrap();
      setResendCountdown(60);
      Swal.fire({
        icon: "success",
        title: t.home.registerModal.otpSent,
        text: t.home.registerModal.otpSentText,
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to resend OTP",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // OTP input handler with auto-focus
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    
    if (numericValue.length <= 1) {
      const newOtp = otp.split("");
      newOtp[index] = numericValue;
      setOtp(newOtp.join(""));

      // Auto-focus next input
      if (numericValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length > 1) {
      // Handle paste
      const pastedOtp = numericValue.slice(0, 6);
      setOtp(pastedOtp);
      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      otpInputRefs.current[lastIndex]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Open email app helpers
  const openEmailApp = (provider: "gmail" | "yahoo" | "outlook") => {
    const urls = {
      gmail: "https://mail.google.com",
      yahoo: "https://mail.yahoo.com",
      outlook: "https://outlook.live.com",
    };
    window.open(urls[provider], "_blank");
  };

  const isStep1Valid =
    form.name &&
    form.email &&
    form.phone &&
    (selectedPlan !== "enterprise" || (form.company_name && form.company_name.trim()));
  const isStep2Valid = form.password && form.password_confirmation && 
    form.password === form.password_confirmation && form.password.length >= 8;
  const isStep3Valid = otp.length === 6;

  return (
    <div className="flex flex-col w-full">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
        aria-label="Close modal"
      >
        <X size={18} />
      </button>

      {/* Header - Fixed */}
      <div className="text-center mb-6 px-2">
        {selectedPlan && (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 mb-3">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {t.home.registerModal.registeringFor ?? "Registering for"}
            </span>
            <span className="text-sm font-black text-emerald-400">
              {PLAN_LABELS[selectedPlan] ?? selectedPlan}
            </span>
          </div>
        )}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-3 shadow-lg shadow-emerald-500/20">
          {step === 3 ? <KeyRound className="text-white" size={28} /> : <Crown className="text-white" size={28} />}
        </div>
        <h2 className="text-2xl font-black text-white mb-1">
          {step === 3 ? t.home.registerModal.otpTitle : t.home.registerModal.title}
        </h2>
        <p className="text-white/60 text-sm">
          {step === 3 ? (
            <>
              {t.home.registerModal.otpSubtitle}{" "}
              <span className="text-emerald-400 font-semibold">{form.email}</span>
            </>
          ) : (
            t.home.registerModal.subtitle
          )}
        </p>
      </div>

      {/* Step Indicator - Fixed */}
      <div className="flex items-center justify-center gap-2 mb-6 px-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 1 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
          }`}>
            {step > 1 ? <CheckCircle2 size={14} /> : "1"}
          </div>
          <span className={`text-[10px] font-medium hidden sm:inline ${step >= 1 ? "text-white" : "text-white/40"}`}>
            Info
          </span>
        </div>
        <div className={`w-6 h-0.5 rounded-full transition-all ${
          step >= 2 ? "bg-emerald-500" : "bg-white/10"
        }`} />
        <div className="flex items-center gap-1.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 2 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
          }`}>
            {step > 2 ? <CheckCircle2 size={14} /> : "2"}
          </div>
          <span className={`text-[10px] font-medium hidden sm:inline ${step >= 2 ? "text-white" : "text-white/40"}`}>
            Password
          </span>
        </div>
        <div className={`w-6 h-0.5 rounded-full transition-all ${
          step >= 3 ? "bg-emerald-500" : "bg-white/10"
        }`} />
        <div className="flex items-center gap-1.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 3 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
          }`}>
            3
          </div>
          <span className={`text-[10px] font-medium hidden sm:inline ${step >= 3 ? "text-white" : "text-white/40"}`}>
            Verify
          </span>
        </div>
      </div>

      {/* Form Container - Fixed Width/Padding */}
      <div className="w-full px-2 overflow-hidden">
        <div className="relative" style={{ minHeight: "280px" }}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.fullName}
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.fullNamePlaceholder}
                      autoComplete="name"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.email}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.emailPlaceholder}
                      className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl ${
                        errors.email ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <X size={11} />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.whatsapp}
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9+]*"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.whatsappPlaceholder}
                      className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl ${
                        errors.phone ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    {errors.phone ? (
                      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <X size={11} />
                        {errors.phone}
                      </p>
                    ) : (
                      <p className="text-[11px] text-white/40 mt-1.5 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        {t.home.registerModal.whatsappHint}
                      </p>
                    )}
                  </div>

                  {showCompanyField && (
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                        {t.home.registerModal.companyName ?? "Company Name"}
                        {selectedPlan === "enterprise" && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      <Input
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        placeholder={t.home.registerModal.companyNamePlaceholder ?? "Your company or organization"}
                        autoComplete="organization"
                        className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl ${
                          errors.company_name ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      />
                      {errors.company_name && (
                        <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                          <X size={11} />
                          {errors.company_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.password}
                    </label>
                    <Input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.passwordPlaceholder}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl"
                    />
                    <div className="h-5 mt-1.5">
                      {form.password && form.password.length < 8 && (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <Sparkles size={11} />
                          {t.home.registerModal.passwordMinHint}
                        </p>
                      )}
                      {form.password && form.password.length >= 8 && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          {t.home.registerModal.passwordStrong}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.confirmPassword}
                    </label>
                    <Input
                      type="password"
                      name="password_confirmation"
                      autoComplete="new-password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.confirmPasswordPlaceholder}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl"
                    />
                    <div className="h-5 mt-1.5">
                      {form.password_confirmation && form.password !== form.password_confirmation && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1">
                          <X size={11} />
                          {t.home.registerModal.passwordMismatch}
                        </p>
                      )}
                      {form.password_confirmation && form.password === form.password_confirmation && form.password.length >= 8 && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          {t.home.registerModal.passwordMatch}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="space-y-5">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide text-center">
                      {t.home.registerModal.otpPlaceholder}
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={otp[index] || ""}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                            setOtp(pastedData);
                            const lastIndex = Math.min(pastedData.length - 1, 5);
                            otpInputRefs.current[lastIndex]?.focus();
                          }}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-white rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Email Access Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/50 text-center">
                      {t.home.registerModal.checkEmail}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => openEmailApp("gmail")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                        </svg>
                        {t.home.registerModal.openGmail}
                      </button>
                      <button
                        onClick={() => openEmailApp("yahoo")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.828 12.834l4.428-7.633h-3.32l-2.733 5.14-2.936-5.14h-3.44l4.553 7.633v5.965h3.448v-5.965zm4.32-7.633h3.32l-4.428 7.633v5.965h-3.448v-5.965l-4.553-7.633h3.44l2.936 5.14 2.733-5.14z"/>
                        </svg>
                        {t.home.registerModal.openYahoo}
                      </button>
                      <button
                        onClick={() => openEmailApp("outlook")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-xs font-medium transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.231-.584.231h-8.462v-6.884l1.736 1.242 1.32-.944V9.478l-1.32.908-1.736-1.213V5.019h8.462c.232 0 .426.077.584.231.158.152.238.346.238.576v1.561zm-10.262-2.368v15.9H0V5.02h13.738zm-2.09 6.136c0-.893-.238-1.604-.713-2.133-.475-.53-1.103-.794-1.885-.794-.78 0-1.408.264-1.883.794-.476.529-.713 1.24-.713 2.133 0 .888.237 1.596.713 2.124.475.527 1.103.791 1.883.791.782 0 1.41-.264 1.885-.791.475-.528.713-1.236.713-2.124z"/>
                        </svg>
                        {t.home.registerModal.openOutlook}
                      </button>
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-2">
                      {t.home.registerModal.didntReceive}
                    </p>
                    {resendCountdown > 0 ? (
                      <p className="text-xs text-white/60">
                        {t.home.registerModal.resendOtpIn}{" "}
                        <span className="text-emerald-400 font-bold">{resendCountdown}</span>{" "}
                        {t.home.registerModal.seconds}
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
                      >
                        {isResending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        {t.home.registerModal.resendOtp}
                      </button>
                    )}
                    <p className="text-[10px] text-white/30 mt-2">
                      {t.home.registerModal.checkSpam}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="mt-4 px-2 space-y-3">
        {step === 1 ? (
          <button
            onClick={handleStep1Continue}
            disabled={!isStep1Valid}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {t.home.registerModal.continue}
            <ArrowRight size={18} />
          </button>
        ) : step === 2 ? (
          <>
            <button
              disabled={submitting || !isStep2Valid}
              onClick={handleRegister}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t.home.registerModal.registering}</span>
                </>
              ) : (
                <>
                  {t.home.registerModal.continue}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="w-full h-10 text-white/50 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="rotate-180" size={14} />
              {t.home.registerModal.backToInfo}
            </button>
          </>
        ) : (
          <>
            <button
              disabled={isValidating || !isStep3Valid}
              onClick={handleVerifyOtp}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isValidating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t.home.registerModal.verifying}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{t.home.registerModal.verifyOtp}</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setStep(2)}
              className="w-full h-10 text-white/50 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="rotate-180" size={14} />
              {t.home.registerModal.backToPassword}
            </button>
          </>
        )}
      </div>

      {/* Trust Badges - Fixed at Bottom */}
      <div className="mt-5 pt-4 border-t border-white/5 px-2">
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <div className="flex items-center gap-1 text-white/50">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>{t.home.registerModal.trustBadge1}</span>
          </div>
          <div className="flex items-center gap-1 text-white/50">
            <Zap size={12} className="text-amber-400" />
            <span>{t.home.registerModal.trustBadge2}</span>
          </div>
          <div className="flex items-center gap-1 text-white/50">
            <Trophy size={12} className="text-purple-400" />
            <span>{t.home.registerModal.trustBadge3}</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-3">
          {t.home.registerModal.termsText}{" "}
          <Link href="/terms-of-service" className="underline hover:text-white/50">
            {t.home.registerModal.termsLink}
          </Link>
          {language === "id" ? " kami" : ""}
        </p>
      </div>
    </div>
  );
}
