"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combo-box";
import {
  useCreateProgramsMutation,
  useGetProgramsByIdQuery,
  useUpdateProgramsMutation,
} from "@/services/programs/programs.service";
import {
  useGetSalesListQuery,
  useCreateSalesMutation,
  useDeleteSalesMutation,
} from "@/services/programs/sales.service";
import type { Sales } from "@/types/programs/sales";
import { useGetCategoriesListQuery } from "@/services/programs/categories.service";
import { useGetUsersListQuery } from "@/services/users-management.service";
import Swal from "sweetalert2";
import { X, Loader2, Image as ImageIcon, Mail } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  program_category_id: number | null;
  owner_id: number | null;
  title: string;
  sub_title: string;
  slug: string;
  description: string;
  parameter: string;
  status: boolean;
};

interface UserRole {
  id: number;
  name: string;
}

// Interface tambahan untuk menghindari 'any'
interface CategoryOption {
  id: number;
  name: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function ProgramsForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";
  const [tagInput, setTagInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailRaw, setEmailRaw] = useState("");
  const PUBLIC_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

  const { data: session } = useSession();

  const isOwner = useMemo(() => {
    const user = session?.user as { roles?: UserRole[] } | undefined;
    const roles = user?.roles || [];
    return roles.some((r) => r.name === "owner");
  }, [session]);

  // 1. Fetch Lists
  const { data: catResp, isLoading: loadingCats } = useGetCategoriesListQuery({
    page: 1,
    paginate: 100,
  });
  const { data: userResp, isLoading: loadingUsers } = useGetUsersListQuery({
    paginate: 100,
  });

  // 2. Fetch Detail
  const { data: detail, isFetching: fetchingDetail } = useGetProgramsByIdQuery(
    id ?? 0,
    {
      skip: !isEdit || !id,
    }
  );

  // 3. Fetch Sales Emails (Edit Mode Only)
  const { data: salesResp } = useGetSalesListQuery(
    { page: 1, paginate: 1000, program_id: id },
    { skip: !isEdit || !id }
  );

  const [createProgram, { isLoading: creating }] = useCreateProgramsMutation();
  const [updateProgram, { isLoading: updating }] = useUpdateProgramsMutation();
  const [createSales] = useCreateSalesMutation();
  const [deleteSales] = useDeleteSalesMutation();

  const categories = useMemo(() => catResp?.data ?? [], [catResp]);
  const users = useMemo(() => userResp?.data ?? [], [userResp]);

  const initial: FormState = useMemo(
    () => ({
      program_category_id: detail?.program_category_id ?? null,
      owner_id: detail?.owner_id ?? null,
      title: detail?.title ?? "",
      sub_title: detail?.sub_title ?? "",
      slug: detail?.slug ?? "",
      description: detail?.description ?? "",
      parameter: detail?.parameter ?? "",
      status: detail?.status === 1 || detail?.status === true || !isEdit,
    }),
    [detail, isEdit]
  );

  const [form, setForm] = useState<FormState>(initial);
  const [formSales, setFormSales] = useState<Sales>({
    id: 0,
    program_id: id || 0,
    email: "",
    is_corporate: 1,
    status: 1,
  });

  const ownerInfo = useMemo(() => {
    const selectedOwner = users.find((u: UserOption) => u.id === Number(form.owner_id || (isOwner ? session?.user?.id : 0)));
    const email = selectedOwner?.email || "";
    const domain = email.split("@")[1]?.toLowerCase() || "";
    // Dianggap corporate jika ada domain dan bukan domain public
    const isCorporate = domain && !PUBLIC_DOMAINS.includes(domain);
    
    return { email, domain, isCorporate };
  }, [form.owner_id, users, session, isOwner]);

  const extractEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    return Array.from(new Set(matches)); // Mengambil nilai unik
  };

  const detectedEmails = useMemo(() => {
    const rawList = extractEmails(emailRaw);
    
    if (ownerInfo.isCorporate) {
      // Jika Corporate: Filter hanya yang domainnya sama dengan owner
      return rawList.filter(email => email.toLowerCase().endsWith(`@${ownerInfo.domain}`));
    }
    
    // Jika Non-Corporate: Izinkan semua format email valid
    return rawList;
  }, [emailRaw, ownerInfo]);

  useEffect(() => {
    setFormSales((prev) => ({
      ...prev,
      email: detectedEmails.join("|"),
    }));
  }, [detectedEmails]);

  // Sync Form & Sales Data when Edit Mode
  useEffect(() => {
    if (open) {
      setForm(initial);

      // Jika mode edit, kumpulkan email dari API sales dan masukkan ke formSales.email string
      if (isEdit && salesResp?.data) {
        const existingEmailsArray = salesResp.data.map((item: Sales) => item.email);
        const emailString = existingEmailsArray.join("|");

        setFormSales((prev) => ({
          ...prev,
          email: emailString,
          program_id: id || 0,
        }));

        setEmailRaw(existingEmailsArray.join("\n"));
      } else {
        setEmailRaw("");
        setFormSales({
          id: 0,
          program_id: 0,
          email: "",
          is_corporate: 1,
          status: 1,
        });
      }

      if (isEdit && detail?.original) {
        setImagePreview(detail.original as string);
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [initial, open, isEdit, detail, salesResp, id]);

  const handleEmailRawChange = (val: string) => {
    setEmailRaw(val);
    const parsed = extractEmails(val);
    setFormSales((prev) => ({
      ...prev,
      email: parsed.join("|"), // Ini yang akan dikirim ke API
    }));
  };
  // Mengubah string "a|b|c" menjadi array ["a", "b", "c"] untuk tampilan
  const tags = useMemo(() => {
    return form.parameter
      ? form.parameter.split("|").filter((t) => t !== "")
      : [];
  }, [form.parameter]);

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      const newTags = [...tags, val];
      set("parameter", newTags.join("|")); // Simpan kembali sebagai string dengan pemisah |
    }
    setTagInput(""); // Reset input
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, i) => i !== indexToRemove);
    set("parameter", newTags.join("|"));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Mencegah form submit saat tekan enter di input tag
      addTag();
    }
  };

  // Mengubah string "a|b|c" menjadi array ["a", "b", "c"] untuk tampilan
  const emails = useMemo(() => {
    return formSales.email
      ? formSales.email.split("|").filter((t) => t !== "")
      : [];
  }, [formSales.email]);

  const addEmail = () => {
    const val = emailInput.trim();
    if (val && !emails.includes(val)) {
      const newEmails = [...emails, val];
      setFormSales((prev) => ({ ...prev, email: newEmails.join("|") })); // Simpan kembali sebagai string dengan pemisah |
    }
    setEmailInput(""); // Reset input
  };

  const removeEmail = (indexToRemove: number) => {
    const newEmails = emails.filter((_, i) => i !== indexToRemove);
    setFormSales((prev) => ({ ...prev, email: newEmails.join("|") })); // Simpan kembali sebagai string dengan pemisah |
  };

  // Image States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      // If editing and has an image URL from backend
      if (isEdit && detail?.original) {
        setImagePreview(detail.original as string);
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [initial, open, isEdit, detail]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const handleTitleChange = (val: string) => {
    set("title", val);
    if (!isEdit) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      set("slug", slug);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. Tentukan ownerId (dari session jika owner, atau dari form jika admin)
    let ownerId = form.owner_id;
    if (isOwner && session?.user?.id) {
      ownerId = Number(session.user.id);
    }

    if (!form.title || !form.program_category_id || !ownerId) {
      return Swal.fire({ icon: "warning", title: "Fill required fields" });
    }

    // 2. Cari Email Owner dari list users untuk pengecekan domain
    // FIX: Mengganti any dengan UserOption
    const selectedOwner = users.find(
      (u: UserOption) => u.id === Number(ownerId)
    );
    const ownerEmail = selectedOwner?.email || "";
    // Ambil domain saja (misal: bca.com)
    const ownerDomain = ownerEmail.split("@")[1]?.toLowerCase();

    const formData = new FormData();
    // ... (Logika append formData tetap sama seperti sebelumnya)
    Object.entries(form).forEach(([key, value]) => {
      if (key === "owner_id") {
        formData.append("owner_id", String(ownerId));
      } else if (key === "status") {
        formData.append(key, value ? "1" : "0");
      } else {
        formData.append(key, String(value ?? ""));
      }
    });
    if (imageFile) formData.append("image", imageFile);
    if (isEdit) formData.append("_method", "PUT");

    try {
      let programId = id;

      if (isEdit && id) {
        await updateProgram({ id, payload: formData }).unwrap();
        const existingSales = salesResp?.data || [];
        if (existingSales.length > 0) {
          // FIX: Mengganti any dengan Sales
          const deletePromises = existingSales.map((sale: Sales) =>
            deleteSales(sale.id).unwrap()
          );
          await Promise.all(deletePromises);
        }
      } else {
        const res = await createProgram(formData).unwrap();
        programId = res.id;
      }

      // 3. Create Sales Baru dengan Logika is_corporate
      if (programId && detectedEmails.length > 0) {
        const salesPromises = detectedEmails.map((email) => {
          return createSales({
            program_id: programId as number,
            email: email,
            is_corporate: ownerInfo.isCorporate ? 1 : 0, // Mengikuti status owner
            status: 1,
          }).unwrap();
        });

        await Promise.all(salesPromises);
      }

      await Swal.fire({
        icon: "success",
        title: `Program ${isEdit ? "Updated" : "Created"} & Sales Synchronized`,
      });
      onSuccess();
      // FIX: Mengganti any dengan unknown & Interface ApiError
    } catch (err: unknown) {
      const error = err as ApiError;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Failed to process request",
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Program" : "Create New Program"}
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

        {fetchingDetail ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="animate-spin text-sky-600 h-10 w-10" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
              <Label className="font-semibold">Category *</Label>
              <Combobox
                value={form.program_category_id}
                onChange={(val) => set("program_category_id", val)}
                data={categories}
                isLoading={loadingCats}
                placeholder="Select category"
                getOptionLabel={(opt: CategoryOption) => opt.name}
              />
              </div>
              {isOwner ? (
              <div className="space-y-2">
                <Label className="font-semibold">Owner *</Label>
                <Input
                value={session?.user?.name || ""}
                disabled
                className="bg-zinc-100"
                />
                <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input
                  value={session?.user?.email || ""}
                  readOnly
                  className="bg-zinc-100 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Type</Label>
                  <Input
                  value="Corporate"
                  readOnly
                  className="bg-zinc-100 text-xs"
                  />
                </div>
                </div>
              </div>
              ) : (
              <div className="space-y-2">
                <Label className="font-semibold">Owner *</Label>
                <Combobox
                value={form.owner_id}
                onChange={(val) => set("owner_id", val)}
                data={users}
                isLoading={loadingUsers}
                placeholder="Select owner"
                getOptionLabel={(opt: UserOption) => opt.name}
                />
                {form.owner_id && (() => {
                const selectedOwner = users.find((u: UserOption) => u.id === Number(form.owner_id));
                if (!selectedOwner) return null;
                const ownerDomain = selectedOwner.email?.split("@")[1]?.toLowerCase();
                return (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input
                    value={selectedOwner.email}
                    readOnly
                    className="bg-zinc-100 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Type</Label>
                    <Input
                    value={ownerDomain ? "Corporate" : "Non Corporate"}
                    readOnly
                    className="bg-zinc-100 text-xs"
                    />
                  </div>
                  </div>
                );
                })()}
              </div>
              )}
            </div>


            <div className="space-y-2">
              <Label className="font-semibold">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
              Slug: <span className="font-mono">{form.slug || "-"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Sub Title</Label>
              <Input
                value={form.sub_title}
                onChange={(e) => set("sub_title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="font-semibold">Program Cover Image</Label>
              <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed p-4 transition-colors hover:bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-zinc-100">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      className="max-w-[250px] text-xs"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] ?? null)
                      }
                    />
                    <p className="text-[10px] text-zinc-500">
                      Recommended: 1200x630px (PNG, JPG)
                    </p>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 w-fit px-3 text-[10px]"
                        onClick={() => handleImageChange(null)}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">
                Parameters (Tag System)
              </Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                {/* Menampilkan Tag yang sudah ada */}
                {tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2 py-1 rounded-md text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Input untuk mengetik tag baru */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    tags.length === 0
                      ? "Ketik lalu tekan Enter..."
                      : "Tambah lagi..."
                  }
                  className="flex-1 min-w-[120px] outline-none text-sm py-1"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTag}
                  className="h-7 px-2 text-sky-600 hover:bg-sky-100"
                >
                  Tambah
                </Button>
              </div>
              <p className="text-[10px] text-zinc-500 italic">
                Contoh: Perusahaan, Gaji, Lokasi (Tekan Enter untuk menambah)
              </p>
            </div>

            {/* Bagian Email Sales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Label className="font-semibold text-gray-700">Email (Sales)</Label>
                  <p className="text-[10px] text-zinc-500">
                    {ownerInfo.isCorporate 
                      ? `Mode Corporate: Hanya domain @${ownerInfo.domain} yang diterima` 
                      : "Mode Personal: Semua domain email diterima"}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {detectedEmails.length} Email Terdeteksi
                </span>
              </div>
              
              <Textarea
                placeholder="Masukkan banyak email di sini... (Copy-paste dari mana saja)"
                value={emailRaw}
                onChange={(e) => setEmailRaw(e.target.value)} // Langsung set raw, filter diurus useMemo
                className="min-h-[120px] font-mono text-sm resize-y focus-visible:ring-sky-500"
              />
              
              {/* Preview Email yang Lolos Filter */}
              {detectedEmails.length > 0 && (
                <div className="rounded-lg border border-dashed p-3 bg-zinc-50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wider">
                    List Email Terfilter:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detectedEmails.map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-[11px] font-medium animate-in fade-in zoom-in duration-200"
                      >
                        <Mail className="h-3 w-3" />
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info tambahan jika ada email yang terbuang/terfilter (Optional) */}
              {emailRaw && extractEmails(emailRaw).length > detectedEmails.length && (
                <p className="text-[10px] text-red-500 font-medium">
                  * Beberapa email diabaikan karena tidak sesuai dengan domain owner (@{ownerInfo.domain})
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-xl border bg-zinc-50 p-4">
              <input
                id="p-status"
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.status}
                onChange={(e) => set("status", e.target.checked)}
              />
              <Label htmlFor="p-status" className="font-bold cursor-pointer">
                Published / Active
              </Label>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 px-10 hover:bg-sky-700"
                disabled={creating || updating}
              >
                {creating || updating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Save Program"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}