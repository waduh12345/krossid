"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CreditCard, Upload, Building2 } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useI18n } from "@/contexts/i18n-context";
import { useGetPackageByIdQuery } from "@/services/package/package.service";
import { useSubmitCheckoutMutation } from "@/services/package/checkout.service";
import {
  getStoredCheckoutForm,
  clearStoredCheckoutForm,
  type PricingCheckoutFormData,
} from "../register/page";
import type { PackageCheckoutPayloadWithFile } from "@/types/package/checkout";
import Swal from "sweetalert2";

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer Manual", desc: "Transfer ke rekening berikut" },
] as const;

/** Informasi rekening (bisa dipindah ke env atau API nanti) */
const BANK_INFO = {
  bankName: "Bank Central Asia (BCA)",
  accountNumber: "1234567890",
  accountName: "PT Kross Indonesia",
};

export default function PricingPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { data: session, status: sessionStatus } = useSession();

  const packageIdParam = searchParams.get("package_id");
  const packageId = packageIdParam ? Number(packageIdParam) : null;
  const billing = (searchParams.get("billing") as "monthly" | "yearly") || "monthly";

  const [formData, setFormData] = useState<PricingCheckoutFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: pkg, isFetching: loadingPackage } = useGetPackageByIdQuery(
    packageId ?? 0,
    { skip: !packageId }
  );
  const [submitCheckout] = useSubmitCheckoutMutation();

  useEffect(() => {
    const stored = getStoredCheckoutForm();
    if (!stored) {
      router.replace(`/pricing/register?package_id=${packageId}&billing=${billing}`);
      return;
    }
    setFormData(stored);
  }, [packageId, billing, router]);

  useEffect(() => {
    if (!packageId) router.replace("/pricing");
  }, [packageId, router]);

  const amount = useMemo(() => {
    if (!pkg) return 0;
    return billing === "yearly" ? pkg.price_year : pkg.price_month;
  }, [pkg, billing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !packageId || !pkg) return;
    if (!proofFile) {
      await Swal.fire({
        icon: "warning",
        title: "Bukti pembayaran wajib",
        text: "Silakan upload bukti pembayaran (gambar atau PDF).",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: PackageCheckoutPayloadWithFile = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        office: formData.office,
        address: formData.address,
        user_id: session?.user?.id ? Number(session.user.id) : undefined,
        package_id: packageId,
        billing_period: billing,
        amount,
        payment_method: paymentMethod.trim() || null,
        proof_file: proofFile ?? null,
        notes: notes.trim() || null,
        paid_at: new Date().toISOString(),
      };

      const result = await submitCheckout(payload).unwrap();
      const data = result?.data;

      clearStoredCheckoutForm();

      const email = data?.email;
      const password = data?.password;

      if (sessionStatus === "authenticated" && session?.user) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: result?.message ?? "Registrasi dan pembayaran berhasil.",
        });
        router.push("/my-account");
        return;
      }

      if (email && password) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (loginRes?.ok) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Akun dan pembayaran berhasil. Anda sudah masuk.",
          });
          router.push("/my-account");
          return;
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result?.message ?? "Registrasi dan pembayaran berhasil. Silakan login dengan email yang didaftarkan.",
      });
      router.push("/signin?callbackUrl=/my-account");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!packageId || !formData) return null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden ">
      <div className="container mx-auto px-4 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0]/10 via-transparent to-[#DF9B35]/10 pointer-events-none" />
        <div className="flex-shrink-0 px-6 py-3 relative z-10">
          <Link
            href={`/pricing/register?package_id=${packageId}&billing=${billing}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm"
          >
            <ArrowLeft size={16} />
            Back to Form
          </Link>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pb-6 min-h-0 relative z-10 items-start">
          {/* Kiri: Info package + card QRIS | Bank Transfer */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            {loadingPackage ? (
              <div className="flex-1 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Loader2 className="h-10 w-10 animate-spin text-[#367CC0]" />
              </div>
            ) : (
              <>
                {pkg && (
                  <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 flex-shrink-0 flex items-stretch gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Paket dipilih</p>
                      <p className="text-lg font-bold text-white">{pkg.name}</p>
                      <p className="text-white/70 text-xs line-clamp-2">{pkg.description || ""}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0 border-l border-white/10 pl-4">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider">
                        {billing === "yearly" ? "Yearly" : "Monthly"}
                      </p>
                      <p className="text-2xl font-black text-[#7ED321] mt-0.5">
                        Rp{amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col flex-shrink-0 rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl">
                  <div className="flex border-b border-white/10">
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-medium bg-[#367CC0]/30 text-white border-b-2 border-[#367CC0]">
                      <Building2 className="h-4 w-4" />
                      Bank Transfer Manual
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      <p className="text-white/80 text-xs">Transfer ke rekening berikut:</p>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 space-y-1 font-mono text-xs">
                        <p className="text-white">
                          <span className="text-white/50">Bank:</span> {BANK_INFO.bankName}
                        </p>
                        <p className="text-white">
                          <span className="text-white/50">No. Rek:</span> {BANK_INFO.accountNumber}
                        </p>
                        <p className="text-white">
                          <span className="text-white/50">A/n:</span> {BANK_INFO.accountName}
                        </p>
                      </div>
                      <p className="text-white/60 text-xs">
                        Jumlah: <span className="font-bold text-[#7ED321]">Rp{amount.toLocaleString("id-ID")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Kanan: Form input */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-h-0 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-5"
          >
            <h1 className="text-lg font-black text-white mb-0.5">Pembayaran</h1>
            <p className="text-white/60 text-xs mb-3">
              Lengkapi data pembayaran untuk paket yang dipilih.
            </p>

            {loadingPackage ? null : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 flex-shrink-0"
              >
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Metode Pembayaran yang Digunakan
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 pl-8 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0] appearance-none"
                    >
                      <option value="">Pilih metode</option>
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm.value} value={pm.value} className="bg-slate-800 text-white">
                          {pm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Upload Bukti Pembayaran *
                  </label>
                  <div className="rounded-lg border border-white/20 bg-white/5 border-dashed min-h-[72px] flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                      className="sr-only"
                      id="proof-upload"
                    />
                    <label
                      htmlFor="proof-upload"
                      className="flex flex-col items-center justify-center gap-1 py-2 px-4 cursor-pointer text-white/70 hover:text-white transition-colors w-full"
                    >
                      <Upload className="h-8 w-8 text-white/50" />
                      <span className="text-xs text-center">
                        {proofFile ? proofFile.name : "Klik atau drag file (gambar/PDF)"}
                      </span>
                      <span className="text-[10px] text-white/40">Max 5MB • JPG, PNG, PDF</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={1}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#367CC0] resize-none"
                    placeholder="Opsional"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#367CC0] to-[#DF9B35] text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 flex-shrink-0"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Submit & Lanjutkan"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
