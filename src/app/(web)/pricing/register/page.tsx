"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, Building2, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/contexts/i18n-context";

const STORAGE_KEY = "pricing_checkout_form";

export type PricingCheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  office: string;
  address: string;
};

export function getStoredCheckoutForm(): PricingCheckoutFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PricingCheckoutFormData) : null;
  } catch {
    return null;
  }
}

export function setStoredCheckoutForm(data: PricingCheckoutFormData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredCheckoutForm(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export default function PricingRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { data: session, status: sessionStatus } = useSession();

  const packageId = searchParams.get("package_id");
  const billing = (searchParams.get("billing") as "monthly" | "yearly") || "monthly";

  const [form, setForm] = useState<PricingCheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    office: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user) return;
    const u = session.user as { name?: string; email?: string; phone?: string };
    setForm((prev) => ({
      ...prev,
      name: u.name ?? prev.name,
      email: (u.email as string) ?? prev.email,
      phone: (u.phone as string) ?? prev.phone,
    }));
  }, [sessionStatus, session]);

  useEffect(() => {
    if (!packageId) {
      router.replace("/pricing");
      return;
    }
  }, [packageId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return false;
    if (!form.phone.trim()) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !packageId) return;
    setSubmitting(true);
    setStoredCheckoutForm(form);
    router.push(`/pricing/payment?package_id=${packageId}&billing=${billing}`);
    setSubmitting(false);
  };

  if (!packageId) return null;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0]/10 via-transparent to-[#DF9B35]/10" />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Back to Pricing
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <h1 className="text-2xl font-black text-white mb-2">
            {t.pricing?.register ?? "Daftar"}
          </h1>
          <p className="text-white/60 text-sm mb-6">
            Isi data berikut. Jika sudah login, sebagian data akan terisi otomatis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0]"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0]"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0]"
                  placeholder="+62..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Office
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  name="office"
                  value={form.office}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0]"
                  placeholder="Nama kantor / perusahaan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 h-4 w-4 text-white/40" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0] resize-none"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
              <Link
                href="/pricing"
                className="w-full md:flex-1 py-3 rounded-xl border border-white/20 text-white text-center font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:flex-1 py-3 rounded-xl bg-gradient-to-r from-[#367CC0] to-[#DF9B35] text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Next – Pembayaran
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
