"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  Gift,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useGetPackagesQuery } from "@/services/package/package.service";
import { useGetPackageFeaturesQuery } from "@/services/package/feature.service";
import type { Package } from "@/types/package/package";
import type { PackageFeature } from "@/types/package/feature";

const PLAN_ICONS = [Zap, Building2, Sparkles, Gift];

function PackageCard({
  package: pkg,
  index,
  billingPeriod,
  isPopular,
  onRegister,
}: {
  package: Package;
  index: number;
  billingPeriod: "monthly" | "yearly";
  isPopular: boolean;
  onRegister: () => void;
}) {
  const { t } = useI18n();
  const { data: featuresData } = useGetPackageFeaturesQuery({
    page: 1,
    paginate: 50,
    package_id: pkg.id,
  });
  const features: PackageFeature[] = useMemo(
    () => (featuresData?.data ?? []) as PackageFeature[],
    [featuresData]
  );
  const sortedFeatures = useMemo(
    () => [...features].sort((a, b) => a.nomor - b.nomor),
    [features]
  );

  const price =
    billingPeriod === "yearly" ? pkg.price_year : pkg.price_month;
  const discount =
    billingPeriod === "yearly"
      ? pkg.price_discount_year
      : pkg.price_discount_month;
  const displayPrice = discount != null && discount > 0 ? discount : price;
  const isFree = displayPrice === 0;
  const isCustom =
    pkg.price_month === 0 && pkg.price_year === 0 && (pkg.name?.toLowerCase().includes("enterprise") ?? false);
  const Icon = PLAN_ICONS[index % PLAN_ICONS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex flex-col rounded-2xl border overflow-hidden ${
        isPopular
          ? "bg-gradient-to-b from-[#367CC0]/20 to-[#0f172a] border-[#367CC0]/40 shadow-lg shadow-[#367CC0]/10 scale-105 z-10"
          : "bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20"
      }`}
    >
      {/* Landscape image */}
      <div className="relative w-full aspect-[16/9] bg-white/5 overflow-hidden">
        {pkg.image_avif_url ? (
          <img
            src={pkg.image_avif_url}
            alt={pkg.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Icon size={40} className="text-white/20" />
          </div>
        )}
        {isPopular && (
          <div className="absolute top-0 left-0 right-0 py-1.5 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] text-center">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {t.pricing.mostPopular}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black text-white mb-1">{pkg.name}</h3>
        <p className="text-sm text-white/50 mb-5 min-h-[36px] line-clamp-2">
          {pkg.description ?? ""}
        </p>

        <div className="mb-5">
          {isCustom ? (
            <span className="text-2xl sm:text-3xl font-black text-white">{t.pricing.plans?.enterprise?.price ?? "Custom"}</span>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {isFree ? t.pricing.free : `Rp${displayPrice.toLocaleString("id-ID")}`}
              </span>
              {!isFree && (
                <span className="text-white/50 text-xs sm:text-sm font-medium ml-1">
                  {billingPeriod === "yearly" ? t.pricing.perYear : t.pricing.perMonth}
                </span>
              )}
              {discount != null && discount > 0 && price > discount && (
                <span className="ml-2 text-xs text-white/40 line-through">
                  Rp{price.toLocaleString("id-ID")}
                </span>
              )}
            </>
          )}
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {sortedFeatures.map((f) => (
            <li key={f.id} className="flex items-start gap-2 text-sm text-white/80">
              <CheckCircle2 size={16} className="text-[#7ED321] shrink-0 mt-0.5" />
              <span>{f.label}{f.value ? `: ${f.value}` : ""}</span>
            </li>
          ))}
          {sortedFeatures.length === 0 && (
            <li className="text-sm text-white/40">No features listed</li>
          )}
        </ul>

        <button
          type="button"
          onClick={onRegister}
          className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isPopular
              ? "bg-gradient-to-r from-[#367CC0] to-[#DF9B35] text-white hover:opacity-90 shadow-lg shadow-[#367CC0]/20"
              : isCustom
              ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
              : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
          }`}
        >
          {isCustom ? t.pricing.contactSales : t.pricing.register}
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { data: packagesData, isFetching: loadingPackages } = useGetPackagesQuery({
    page: 1,
    paginate: 20,
    search: "",
  });

  const packages: Package[] = useMemo(() => {
    const list = (packagesData?.data ?? []) as Package[];
    const active = list.filter(
      (p) => p.status === 1 || p.status === true
    );
    return active.sort((a, b) => a.number - b.number);
  }, [packagesData]);

  const handleRegister = (pkg: Package) => () => {
    const isCustom = pkg.price_month === 0 && pkg.price_year === 0 && (pkg.name?.toLowerCase().includes("enterprise") ?? false);
    if (isCustom) {
      router.push("/contact-us");
      return;
    }
    router.push(
      `/pricing/register?package_id=${pkg.id}&billing=${billingPeriod}`
    );
  };

  return (
    <div className="min-h-screen relative">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0]/10 via-transparent to-[#DF9B35]/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#367CC0]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DF9B35]/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles size={14} className="text-[#DF9B35]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                {t.pricing.badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {t.pricing.title}{" "}
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                {t.pricing.titleHighlight}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              {t.pricing.description}
            </p>

            <div className="flex items-center justify-center gap-3 mb-10">
              <span
                className={`text-sm font-bold ${billingPeriod === "monthly" ? "text-white" : "text-white/40"}`}
              >
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={billingPeriod === "yearly"}
                onClick={() => setBillingPeriod((p) => (p === "monthly" ? "yearly" : "monthly"))}
                className="relative w-12 h-6 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#367CC0]"
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-[#367CC0] transition-transform ${
                    billingPeriod === "yearly" ? "left-7" : "left-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-bold ${billingPeriod === "yearly" ? "text-white" : "text-white/40"}`}
              >
                Yearly
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-12 md:py-20" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-6">
          <h2 id="pricing-heading" className="sr-only">
            {t.pricing.title} {t.pricing.titleHighlight}
          </h2>

          {loadingPackages ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#367CC0]" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 text-white/60">
              No plans available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 max-w-7xl mx-auto">
              {packages.map((pkg, index) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  index={index}
                  billingPeriod={billingPeriod}
                  isPopular={index === 1}
                  onRegister={handleRegister(pkg)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative py-16 md:py-24" aria-labelledby="cta-heading">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#367CC0]/20 via-[#DF9B35]/20 to-[#367CC0]/20 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 text-center"
          >
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-black text-white mb-4">
              {t.pricing.ctaTitle}
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              {t.pricing.ctaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const first = packages[0];
                  if (first) {
                    router.push(`/pricing/register?package_id=${first.id}&billing=${billingPeriod}`);
                  }
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20 group"
              >
                {t.pricing.getStarted}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all backdrop-blur-md"
              >
                {t.aboutUs?.browsePrograms ?? "Browse Programs"}
                <Sparkles size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-12 md:py-16" aria-labelledby="faq-heading">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 id="faq-heading" className="text-2xl font-black text-white mb-6 flex items-center justify-center gap-2">
              <HelpCircle size={28} className="text-[#367CC0]" />
              {t.pricing.faqTitle}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Have questions? Visit our{" "}
              <Link href="/faq" className="text-[#367CC0] hover:underline font-semibold">
                FAQ
              </Link>{" "}
              or{" "}
              <Link href="/contact-us" className="text-[#367CC0] hover:underline font-semibold">
                contact us
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
