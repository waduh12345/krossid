"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/services/users-management.service";
import { useGetRolesQuery } from "@/services/users.service";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { Combobox } from "@/components/ui/combo-box";
import type { Role } from "@/types/user";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  defaultRoleId?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  status: boolean;
  is_corporate: boolean;
};

export default function UsersForm({
  open,
  mode,
  id,
  defaultRoleId = 2,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetUserByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const { data: rolesResp, isLoading: loadingRoles, refetch: refetchRoles } = useGetRolesQuery();

  const roles: Role[] = Array.isArray(rolesResp)
    ? rolesResp
    : Array.isArray((rolesResp as { data?: Role[] })?.data)
    ? ((rolesResp as { data?: Role[] }).data as Role[])
    : [];

  const initial: FormState = useMemo(
    () => ({
      name: detail?.name ?? "",
      email: detail?.email ?? "",
      // Jika dari backend ada +62, kita hapus supaya konsisten di state (hanya angka)
      phone: detail?.phone ? detail.phone.replace("+62", "") : "",
      password: "",
      password_confirmation: "",
      status: true,
      is_corporate: detail?.is_corporate ?? false,
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(defaultRoleId ?? null);

  useEffect(() => {
    setForm(initial);
    if (isEdit && detail) {
      const firstRole = detail.roles && detail.roles.length > 0 ? detail.roles[0].id : null;
      setSelectedRoleId(firstRole);
    } else if (!isEdit) {
      setSelectedRoleId(defaultRoleId ?? null);
    }
  }, [initial, isEdit, detail, defaultRoleId]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  // Handler khusus nomor HP untuk mencegah input selain angka
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Hapus karakter non-angka
    if (value.length <= 13) { // Batas maksimal digit setelah +62 (misal 13 digit)
      set("phone", value);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validasi Nama
    if (!form.name.trim() || form.name.length < 3) {
      await Swal.fire({ icon: "warning", title: "Nama minimal 3 karakter" });
      return;
    }

    // Validasi Email (Format & Length)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      await Swal.fire({ icon: "warning", title: "Email wajib diisi" });
      return;
    }
    if (!emailRegex.test(form.email)) {
      await Swal.fire({ icon: "warning", title: "Format email tidak valid" });
      return;
    }
    if (form.email.length > 100) {
      await Swal.fire({ icon: "warning", title: "Email terlalu panjang (maks 100)" });
      return;
    }

    // Validasi Nomor HP
    if (!form.phone) {
      await Swal.fire({ icon: "warning", title: "Nomor HP wajib diisi" });
      return;
    }
    if (form.phone.length < 9 || form.phone.length > 13) {
      await Swal.fire({ icon: "warning", title: "Nomor HP harus 9-13 digit" });
      return;
    }

    if (!selectedRoleId) {
      await Swal.fire({ icon: "warning", title: "Pilih role terlebih dahulu" });
      return;
    }

    if (!isEdit) {
      if (!form.password) {
        await Swal.fire({ icon: "warning", title: "Password wajib diisi" });
        return;
      }
      if (form.password.length < 6) {
        await Swal.fire({ icon: "warning", title: "Password minimal 6 karakter" });
        return;
      }
      if (form.password !== form.password_confirmation) {
        await Swal.fire({ icon: "warning", title: "Konfirmasi password tidak sama" });
        return;
      }
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: `+62${form.phone}`, // Gabungkan kembali saat kirim ke API
      status: form.status ? 1 : 0,
      is_corporate: form.is_corporate ? 1 : 0,
      role_id: selectedRoleId,
    };

    try {
      if (isEdit && id) {
        await updateUser({ id, payload }).unwrap();
        await Swal.fire({ icon: "success", title: "User diperbarui" });
      } else {
        await createUser({
          ...payload,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }).unwrap();
        await Swal.fire({ icon: "success", title: "User dibuat" });
      }
      onSuccess();
    } catch (err: any) {
      await Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err?.data?.message || "Gagal memproses data.",
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit User" : "Tambah User"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-medium">Nama Lengkap</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Masukkan nama sesuai KTP"
              maxLength={50}
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
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Nomor HP</Label>
              <div className="relative flex items-center">
                {/* Visual Prefix */}
                <span className="absolute left-3 text-sm font-semibold text-gray-500">
                  +62
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className="pl-12" // Padding left agar tidak bertumpuk dengan +62
                  placeholder="8123456xxx"
                />
              </div>
              <p className="text-[10px] text-gray-400 italic">*Hanya angka, 9-13 digit</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Role</Label>
            <Combobox<Role>
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val)}
              onOpenRefetch={() => { void refetchRoles(); }}
              data={roles}
              isLoading={loadingRoles}
              placeholder="Pilih role pengguna"
              getOptionLabel={(r) => r.name}
            />
          </div>

          {!isEdit && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 6 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => set("password_confirmation", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <input
                id="status"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.status}
                onChange={(e) => set("status", e.target.checked)}
              />
              <Label htmlFor="status" className="cursor-pointer">User Aktif</Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_corporate"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.is_corporate}
                onChange={(e) => set("is_corporate", e.target.checked)}
              />
              <Label htmlFor="is_corporate" className="cursor-pointer">Akun Corporate</Label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-sky-600 px-8 hover:bg-sky-700"
              disabled={creating || updating || (isEdit && isFetching)}
            >
              {isEdit ? "Simpan Perubahan" : "Buat User Baru"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}