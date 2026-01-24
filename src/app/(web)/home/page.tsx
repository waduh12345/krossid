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
import { motion } from "framer-motion";
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
}: SidebarLeftProps) => (
  <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit">
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-6">
        <Filter size={14} /> Filter
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

/* ================== SIDEBAR RIGHT ================== */
const SidebarRight = ({
  topPrograms,
  onRegister,
}: {
  topPrograms: any[];
  onRegister: () => void;
}) => (
  <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-6">
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-6">
        <Crown size={14} className="text-yellow-400" /> Top Programs
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
            No top programs yet
          </div>
        )}
      </div>
    </div>

    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white">
      <h4 className="text-lg font-black mb-2">Become a Product Owner</h4>
      <p className="text-sm text-white/90 mb-6">
        Monetisasi produk Anda dengan sistem affiliate.
      </p>
      <button
        onClick={onRegister}
        className="w-full bg-white text-blue-600 font-black py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition"
      >
        <PlusCircle size={16} /> Register as Owner
      </button>
    </div>
  </aside>
);

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

  const [activeCategory, setActiveCategory] = useState("All");
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
    if (activeCategory === "All") return programs;
    return programs.filter(
      (p) => p.program_category_name === activeCategory
    );
  }, [programs, activeCategory]);

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
                ? DUMMY_CATEGORIES
                : categories?.data
                ? ["All", ...categories.data.map((c: any) => c.name)]
                : ["All"]
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
                <p className="text-white/50 text-sm">Loading programs...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPrograms.length === 0 && !useDummyData && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <Sparkles className="text-yellow-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-black text-white mb-2">
                  No Programs Found
                </h3>
                <p className="text-white/50 text-sm">
                  Try selecting a different category or check back later.
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
                              {prog.commission}% Commission
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
                            <ShieldCheck size={14} /> Verified
                          </span>
                          <span className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 transition-colors">
                            Join <ArrowRight size={14} />
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
                      End of content
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
          <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-white/10 rounded-3xl p-8">
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

  useEffect(() => {
    gsap.fromTo(
      ".fade-up",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }
    );
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (form.password !== form.password_confirmation) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Cocok",
        text: "Pastikan password dan konfirmasi password sama",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (form.password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password Terlalu Pendek",
        text: "Password minimal 8 karakter",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      setSubmitting(true);
      await register({ ...form, role: "owner" }).unwrap();
      
      await Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil! 🎉",
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="margin-bottom: 10px; font-size: 16px;">Akun Product Owner Anda berhasil dibuat!</p>
            <p style="color: #6b7280; font-size: 14px;">Anda akan diarahkan ke halaman login...</p>
          </div>
        `,
        confirmButtonColor: "#10b981",
        confirmButtonText: "Masuk ke Login",
        timer: 3000,
        timerProgressBar: true,
      });
      
      onClose();
      router.push("/login");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text: err?.data?.message || "Terjadi kesalahan saat registrasi. Silakan coba lagi.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    { icon: Users, text: "Jaringan Affiliate Luas", color: "text-blue-400" },
    { icon: TrendingUp, text: "Analytics Real-time", color: "text-purple-400" },
  ];

  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
        aria-label="Close modal"
      >
        <X size={18} />
      </button>

      {/* Marketing Header */}
      <div className="text-center mb-6 fade-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-600 mb-4 shadow-lg">
          <Crown className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Jadi Product Owner Sekarang!
        </h2>
        <p className="text-white/70 text-sm mb-4">
          Monetisasi produk Anda dengan sistem affiliate terpercaya
        </p>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10"
            >
              <benefit.icon className={`${benefit.color} flex-shrink-0`} size={16} />
              <span className="text-xs font-bold text-white/80">{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-2 mb-6 fade-up">
        {[1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
              step >= s 
                ? "bg-gradient-to-r from-green-400 to-blue-600 w-12" 
                : "bg-white/10 w-8"
            }`}
            aria-label={`Go to step ${s}`}
          />
        ))}
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 fade-up"
        >
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2">
              Nama Lengkap
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2">
              Nomor WhatsApp
            </label>
            <Input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
            <p className="text-xs text-white/40 mt-1">
              Pastikan nomor aktif untuk verifikasi
            </p>
          </div>
          
          <motion.button
            onClick={() => setStep(2)}
            disabled={!form.name || !form.email || !form.phone}
            whileHover={{ scale: form.name && form.email && form.phone ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-xl font-black text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            Lanjutkan
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 fade-up"
        >
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
            />
            {form.password && form.password.length < 8 && (
              <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                <Sparkles size={12} />
                Password minimal 8 karakter
              </p>
            )}
            {form.password && form.password.length >= 8 && (
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Password kuat
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2">
              Konfirmasi Password
            </label>
            <Input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Ulangi password Anda"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
            />
            {form.password_confirmation && form.password !== form.password_confirmation && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <X size={12} />
                Password tidak cocok
              </p>
            )}
            {form.password_confirmation && form.password === form.password_confirmation && form.password.length >= 8 && (
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Password cocok
              </p>
            )}
          </div>
          
          <motion.button
            disabled={submitting || !form.password || !form.password_confirmation || form.password !== form.password_confirmation || form.password.length < 8}
            onClick={handleSubmit}
            whileHover={{ scale: submitting || !form.password || !form.password_confirmation || form.password !== form.password_confirmation || form.password.length < 8 ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-blue-600 py-4 rounded-xl font-black text-white hover:from-green-500 hover:via-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Daftar Sekarang</span>
              </>
            )}
          </motion.button>
          
          <button
            onClick={() => setStep(1)}
            className="w-full text-white/60 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 py-2"
          >
            <ArrowRight className="rotate-180" size={16} />
            Kembali ke Informasi
          </button>
        </motion.div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-white/10 fade-up">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-white/60">
            <ShieldCheck size={14} className="text-green-400" />
            <span className="font-bold">100% Aman</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Zap size={14} className="text-yellow-400" />
            <span className="font-bold">Verifikasi Instan</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Trophy size={14} className="text-purple-400" />
            <span className="font-bold">Support 24/7</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/40 mt-4">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" className="underline hover:text-white/60">
            Syarat & Ketentuan
          </Link>{" "}
          kami
        </p>
      </div>
    </>
  );
}
