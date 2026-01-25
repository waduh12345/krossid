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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
} from "lucide-react";

/* ================== UI ================== */
import { Input } from "@/components/ui/input";

/* ================== API ================== */
import { useRegisterMutation } from "@/services/auth.service";
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
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [useDummyData, setUseDummyData] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useGetPublicCategoriesListQuery({
    paginate: 20,
    page: 1,
  });

  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState(t.home.all);
  const [page, setPage] = useState(1);
  const [programs, setPrograms] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching, isError } = useGetPublicProgramsQuery(
    {
      paginate: 5,
      page,
    },
    { skip: useDummyData }
  );

  const { data: topProgramsRes, isLoading: topProgramsLoading } = useGetTopProgramsQuery(
    { paginate: 3 },
    { skip: useDummyData }
  );

  // Use dummy data if API fails or on initial load
  useEffect(() => {
    if (isError || (!isLoading && !data?.data?.length)) {
      setUseDummyData(true);
      setPrograms(DUMMY_PROGRAMS);
      setHasMore(false);
    }
  }, [isError, isLoading, data]);

  /* ===== append ===== */
  useEffect(() => {
    if (useDummyData) return;
    if (!data?.data) return;
    setPrograms((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      return [...prev, ...data.data.filter((p: any) => !ids.has(p.id))];
    });
    if (data.current_page >= data.last_page) setHasMore(false);
  }, [data, useDummyData]);

  /* ===== reset programs when category changes ===== */
  useEffect(() => {
    if (useDummyData) {
      setPrograms(DUMMY_PROGRAMS);
      setHasMore(false);
    } else {
      setPrograms([]);
      setPage(1);
      setHasMore(true);
    }
  }, [activeCategory, useDummyData]);

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
    if (activeCategory === t.home.all || activeCategory === "All" || activeCategory === "Semua") return programs;
    return programs.filter(
      (p) => p.program_category_name === activeCategory
    );
  }, [programs, activeCategory, t]);

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
            {/* Loading State */}
            {isLoading && !useDummyData && programs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-white/50 text-sm">{t.home.loadingPrograms}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPrograms.length === 0 && !useDummyData && (
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== REGISTER MODAL ================== */
function ProductOwnerRegisterModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { t, language } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [register] = useRegisterMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
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
      await register({ ...form, role: "owner" }).unwrap();
      
      await Swal.fire({
        icon: "success",
        title: t.home.registerModal.registerSuccessTitle,
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="margin-bottom: 10px; font-size: 16px;">${t.home.registerModal.registerSuccessText}</p>
            <p style="color: #6b7280; font-size: 14px;">${t.home.registerModal.registerSuccessSubtext}</p>
          </div>
        `,
        confirmButtonColor: "#10b981",
        confirmButtonText: t.home.registerModal.goToLogin,
        timer: 3000,
        timerProgressBar: true,
      });
      
      onClose();
      router.push("/signin");
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

  const isStep1Valid = form.name && form.email && form.phone;
  const isStep2Valid = form.password && form.password_confirmation && 
    form.password === form.password_confirmation && form.password.length >= 8;

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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 mb-3 shadow-lg shadow-emerald-500/20">
          <Crown className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-black text-white mb-1">
          {t.home.registerModal.title}
        </h2>
        <p className="text-white/60 text-sm">
          {t.home.registerModal.subtitle}
        </p>
      </div>

      {/* Step Indicator - Fixed */}
      <div className="flex items-center justify-center gap-3 mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step >= 1 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
          }`}>
            1
          </div>
          <span className={`text-xs font-medium ${step >= 1 ? "text-white" : "text-white/40"}`}>
            Info
          </span>
        </div>
        <div className={`w-8 h-0.5 rounded-full transition-all ${
          step >= 2 ? "bg-emerald-500" : "bg-white/10"
        }`} />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step >= 2 ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
          }`}>
            2
          </div>
          <span className={`text-xs font-medium ${step >= 2 ? "text-white" : "text-white/40"}`}>
            Password
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
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.emailPlaceholder}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                      {t.home.registerModal.whatsapp}
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t.home.registerModal.whatsappPlaceholder}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl"
                    />
                    <p className="text-[11px] text-white/40 mt-1.5 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      {t.home.registerModal.whatsappHint}
                    </p>
                  </div>
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
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="mt-4 px-2 space-y-3">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {t.home.registerModal.continue}
            <ArrowRight size={18} />
          </button>
        ) : (
          <>
            <button
              disabled={submitting || !isStep2Valid}
              onClick={handleSubmit}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{t.home.registerModal.registering}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{t.home.registerModal.registerNow}</span>
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
