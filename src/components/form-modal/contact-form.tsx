"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateContactMutation,
  useGetContactByIdQuery,
  useUpdateContactMutation,
} from "@/services/contact.service";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/utils";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function ContactForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetContactByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const [createContact, { isLoading: creating }] = useCreateContactMutation();
  const [updateContact, { isLoading: updating }] = useUpdateContactMutation();

  const initial: FormState = useMemo(
    () => ({
      name: detail?.name ?? "",
      email: detail?.email ?? "",
      phone: detail?.phone ?? "",
      subject: detail?.subject ?? "",
      message: detail?.message ?? "",
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      await Swal.fire({ icon: "warning", title: "Nama wajib diisi" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      await Swal.fire({ icon: "warning", title: "Email tidak valid" });
      return;
    }

    if (!form.subject.trim()) {
      await Swal.fire({ icon: "warning", title: "Subject wajib diisi" });
      return;
    }

    if (!form.message.trim()) {
      await Swal.fire({ icon: "warning", title: "Pesan wajib diisi" });
      return;
    }

    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    };
    if (form.phone.trim()) {
      payload.phone = form.phone;
    }

    try {
      if (isEdit && id) {
        await updateContact({ id, payload }).unwrap();
        await Swal.fire({ icon: "success", title: "Contact diperbarui" });
      } else {
        await createContact(payload as any).unwrap();
        await Swal.fire({ icon: "success", title: "Contact dibuat" });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as ApiError;
      await Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error?.data?.message || "Gagal memproses data.",
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Contact" : "Tambah Contact"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isEdit && isFetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">Nama</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Masukkan nama"
                maxLength={255}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="contoh@mail.com"
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">
                  Telepon <span className="text-gray-400 text-xs">(opsional)</span>
                </Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="081234567890"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="Masukkan subject"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Pesan</Label>
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Masukkan pesan"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-lg bg-sky-600 px-8 hover:bg-sky-700"
                disabled={creating || updating}
              >
                {creating || updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEdit ? "Simpan Perubahan" : "Buat Contact"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
