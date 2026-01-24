"use client";

import { useState, useEffect } from "react";
import gsap from "gsap";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/services/auth.service";
import type { RegisterPayload } from "@/types/user";
import { useSession } from "next-auth/react";

/* ---------------- SKELETON ---------------- */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />
);

export default function ProductOwnerRegisterPage() {
  const { data: session } = useSession();

  const clientManagerName =
    (session?.user as any)?.name || "Client Manager";

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [register] = useRegisterMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* ---------------- GSAP ---------------- */
  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        ".fade-up",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    }
  }, [loading, step]);

  /* ---------------- FAKE LOADING ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!form.phone) {
      Swal.fire("Error", "Nomor WhatsApp wajib diisi", "error");
      return;
    }

    // 🔐 PASSWORD = NOMOR WHATSAPP
    const payload: RegisterPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.phone,
      password_confirmation: form.phone,
      role: "owner",
    };

    try {
      setSubmitting(true);

      await register(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: "Akun Product Owner Berhasil Dibuat 🚀",
        html: `
          <p>Password awal menggunakan <b>Nomor WhatsApp</b></p>
          <p class="mt-2 text-sm">Silakan ganti password setelah login.</p>
        `,
      });

      setForm({
        name: "",
        email: "",
        phone: "",
      });
      setStep(1);
    } catch (err: any) {
      Swal.fire("Error", err?.data?.message || "Registrasi gagal", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        {/* HEADER */}
        <div className="text-center mb-6 fade-up">
          <h1 className="text-3xl font-black tracking-tight">
            Monetisasi Produk Anda 🚀
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Daftar form sebagai <b>Product Owner</b>
          </p>
        </div>

        {/* CLIENT MANAGER INFO */}
        <div className="mb-6 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white/70 fade-up">
          Client Manager:
          <span className="ml-1 font-black text-white">
            {clientManagerName}
          </span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 fade-up">
            <div>
              <Label className="text-xs text-white/60">Nama Lengkap</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <Label className="text-xs text-white/60">Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email aktif"
              />
            </div>

            <div>
              <Label className="text-xs text-white/60">
                Nomor WhatsApp (Password Awal)
              </Label>
              <Input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#367CC0] py-4 rounded-xl font-black uppercase tracking-wider hover:brightness-110 transition"
            >
              Lanjutkan →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 fade-up">
            <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-xl p-4">
              Password awal akan menggunakan
              <b className="text-white"> nomor WhatsApp</b>.
              <br />
              Anda dapat menggantinya setelah login.
            </div>

            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-[#7ED321] to-[#367CC0] py-4 rounded-xl font-black uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? "Mendaftarkan..." : "Daftarkan Akun Owner"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-xs text-white/40 hover:text-white"
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* TRUST SIGNAL */}
        <div className="flex justify-center gap-4 mt-8 text-[10px] text-white/40 fade-up">
          <span>🔒 Data Aman</span>
          <span>⚡ Aktivasi Instan</span>
          <span>🏆 Verified Platform</span>
        </div>
      </div>
    </div>
  );
}
