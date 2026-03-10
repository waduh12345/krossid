"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { useGetMeQuery } from "@/services/auth.service";
import { usePackageAccess } from "@/hooks/use-package-access";

export default function PackageRenewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: userData } = useGetMeQuery(undefined, { skip: !session });
  const packageAccess = usePackageAccess(userData);

  const packageName =
    userData?.active_package_registration?.package?.name ??
    userData?.owner_package?.package_name ??
    "Paket Anda";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          {packageAccess.isExpired ? (
            <AlertTriangle className="w-10 h-10 text-amber-400" />
          ) : (
            <Clock className="w-10 h-10 text-amber-400" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
          {packageAccess.isExpired
            ? "Paket Anda Telah Berakhir"
            : "Paket Anda Akan Berakhir"}
        </h1>

        <p className="text-white/60 mb-2">
          <span className="font-bold text-white">{packageName}</span>
          {packageAccess.isExpired
            ? ` telah berakhir pada ${packageAccess.activeUntil}.`
            : ` akan berakhir dalam ${packageAccess.daysRemaining} hari (${packageAccess.activeUntil}).`}
        </p>

        <p className="text-white/50 text-sm mb-8">
          Perpanjang paket Anda untuk tetap bisa mengakses fitur quiz, share WhatsApp, dan registrasi program.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#367CC0]/20"
          >
            Perpanjang Paket
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold rounded-xl transition-all"
          >
            Kembali
          </button>
        </div>
      </motion.div>
    </div>
  );
}
