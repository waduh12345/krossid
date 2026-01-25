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
import { X, Loader2, Image as ImageIcon, Mail, GripVertical, Type, Hash, DollarSign, Plus, Trash2 } from "lucide-react";

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
  value_description: string;
  guide_description: string;
  benefit_description: string;
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
  const [numericTagInput, setNumericTagInput] = useState("");
  const [currencyTagInput, setCurrencyTagInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailRaw, setEmailRaw] = useState("");
  const PUBLIC_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];
  
  // Multiple input states for Value Description, Benefit, and Guide
  const [valueDescriptions, setValueDescriptions] = useState<string[]>([""]);
  const [valueBenefits, setValueBenefits] = useState<string[]>([""]);
  const [valueGuides, setValueGuides] = useState<string[]>([""]);

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
    role_id: 3
  })

  // 2. Fetch Detail
  const { data: detail, isFetching: fetchingDetail } = useGetProgramsByIdQuery(
    id ?? 0,
    {
      skip: !isEdit || !id,
      refetchOnMountOrArgChange: true, // Always fetch fresh data when editing
    }
  );

  // 3. Fetch Sales Emails (Edit Mode Only)
  const { data: salesResp } = useGetSalesListQuery(
    { page: 1, paginate: 1000, program_id: id },
    { skip: !isEdit || !id, refetchOnMountOrArgChange: true }
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
      value_description: detail?.value_description ?? "",
      guide_description: detail?.guide_description ?? "",
      benefit_description: detail?.benefit_description ?? "",
    }),
    [detail, isEdit]
  );

  // Initialize multiple inputs from detail data
  useEffect(() => {
    if (open) {
      if (isEdit && detail) {
        // Parse value_description, benefit_description, guide_description from | separator
        if (detail.value_description) {
          const parsed = detail.value_description.split("|").filter(v => v.trim() !== "");
          setValueDescriptions(parsed.length > 0 ? parsed : [""]);
        } else {
          setValueDescriptions([""]);
        }
        
        if (detail.benefit_description) {
          const parsed = detail.benefit_description.split("|").filter(v => v.trim() !== "");
          setValueBenefits(parsed.length > 0 ? parsed : [""]);
        } else {
          setValueBenefits([""]);
        }
        
        if (detail.guide_description) {
          const parsed = detail.guide_description.split("|").filter(v => v.trim() !== "");
          setValueGuides(parsed.length > 0 ? parsed : [""]);
        } else {
          setValueGuides([""]);
        }
      } else {
        // Reset to single empty input for create mode
        setValueDescriptions([""]);
        setValueBenefits([""]);
        setValueGuides([""]);
      }
    }
  }, [detail, isEdit, open]);

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

  // State untuk parameter items dengan tipe dan urutan
  const [parameterItems, setParameterItems] = useState<Array<{id: string; name: string; type: 'alphanumeric' | 'numeric' | 'currency'}>>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Parse parameter dari form ke parameterItems saat modal dibuka atau initial berubah
  useEffect(() => {
    if (open) {
      // Gunakan initial.parameter karena form mungkin belum terupdate
      const parameterValue = initial.parameter || "";
      if (parameterValue) {
        const parsed = parameterValue.split("|").filter(t => t !== "").map((item, idx) => {
          // Format: "name:type" atau hanya "name" (default alphanumeric)
          const [name, type] = item.split(":");
          return {
            id: `item-${idx}-${Date.now()}-${Math.random()}`,
            name: name || item,
            type: (type as 'alphanumeric' | 'numeric' | 'currency') || 'alphanumeric'
          };
        });
        setParameterItems(parsed);
      } else {
        setParameterItems([]);
      }
    }
  }, [open, initial.parameter]);

  // Update form.parameter when parameterItems change
  const updateParameterFromItems = (items: typeof parameterItems) => {
    const paramString = items.map(item => `${item.name}:${item.type}`).join("|");
    set("parameter", paramString);
  };

  const addAlphanumericTag = () => {
    const val = tagInput.trim();
    if (val && !parameterItems.some(item => item.name.toLowerCase() === val.toLowerCase())) {
      const newItems = [...parameterItems, { id: `item-${Date.now()}`, name: val, type: 'alphanumeric' as const }];
      setParameterItems(newItems);
      updateParameterFromItems(newItems);
    }
    setTagInput("");
  };

  const addNumericTag = () => {
    const val = numericTagInput.trim();
    if (val && !parameterItems.some(item => item.name.toLowerCase() === val.toLowerCase())) {
      const newItems = [...parameterItems, { id: `item-${Date.now()}`, name: val, type: 'numeric' as const }];
      setParameterItems(newItems);
      updateParameterFromItems(newItems);
    }
    setNumericTagInput("");
  };

  const addCurrencyTag = () => {
    const val = currencyTagInput.trim();
    if (val && !parameterItems.some(item => item.name.toLowerCase() === val.toLowerCase())) {
      const newItems = [...parameterItems, { id: `item-${Date.now()}`, name: val, type: 'currency' as const }];
      setParameterItems(newItems);
      updateParameterFromItems(newItems);
    }
    setCurrencyTagInput("");
  };

  const removeParameterItem = (id: string) => {
    const newItems = parameterItems.filter(item => item.id !== id);
    setParameterItems(newItems);
    updateParameterFromItems(newItems);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    
    const draggedIndex = parameterItems.findIndex(item => item.id === draggedItem);
    const targetIndex = parameterItems.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newItems = [...parameterItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    
    setParameterItems(newItems);
    updateParameterFromItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent, type: 'alphanumeric' | 'numeric' | 'currency') => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === 'alphanumeric') addAlphanumericTag();
      else if (type === 'numeric') addNumericTag();
      else if (type === 'currency') addCurrencyTag();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alphanumeric': return <Type className="h-3 w-3" />;
      case 'numeric': return <Hash className="h-3 w-3" />;
      case 'currency': return <DollarSign className="h-3 w-3" />;
      default: return <Type className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alphanumeric': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'numeric': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'currency': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
      // Reset email inputs
      setEmailRaw("");
      setEmailInput("");
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
    
    // Combine multiple inputs with | separator
    const valueDescriptionStr = valueDescriptions.filter(v => v.trim() !== "").join("|");
    const benefitDescriptionStr = valueBenefits.filter(v => v.trim() !== "").join("|");
    const guideDescriptionStr = valueGuides.filter(v => v.trim() !== "").join("|");
    
    // Override form values with combined strings
    formData.set("value_description", valueDescriptionStr);
    formData.set("benefit_description", benefitDescriptionStr);
    formData.set("guide_description", guideDescriptionStr);
    
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
      <div className="w-full max-w-4xl rounded-2xl border bg-white p-6 shadow-2xl max-h-[98vh] overflow-y-auto">
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
            <div className="grid gap-4 md:grid-cols-2">
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
              </div>
              )}
            </div>

            {/* Owner Info Row */}
            {(isOwner || form.owner_id) && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input
                    value={isOwner ? (session?.user?.email || "") : (users.find((u: UserOption) => u.id === Number(form.owner_id))?.email || "")}
                    readOnly
                    className="bg-zinc-100 text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Type</Label>
                  <Input
                    value={ownerInfo.isCorporate ? "Corporate" : "Non Corporate"}
                    readOnly
                    className="bg-zinc-100 text-xs h-8"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
                <div className="text-xs text-gray-500">
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
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
                <Label className="font-semibold">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Image Upload Section - Compact */}
              <div className="space-y-2">
                <Label className="font-semibold">Program Cover Image</Label>
                <div className="flex gap-3 rounded-xl border-2 border-dashed p-3 transition-colors hover:bg-zinc-50">
                  <div className="relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-zinc-100">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-xs h-8"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] ?? null)
                      }
                    />
                    <p className="text-[9px] text-zinc-500">
                      Recommended: 1200x630px
                    </p>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-6 w-fit px-2 text-[9px]"
                        onClick={() => handleImageChange(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Email Sales - Compact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Label className="font-semibold text-gray-700">Email (Sales)</Label>
                  <p className="text-[10px] text-zinc-500">
                    {ownerInfo.isCorporate 
                      ? `Corporate: @${ownerInfo.domain}` 
                      : "Personal: Semua domain"}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {detectedEmails.length} Email
                </span>
              </div>
              
              <Textarea
                placeholder="Masukkan banyak email di sini... (Copy-paste dari mana saja)"
                value={emailRaw}
                onChange={(e) => setEmailRaw(e.target.value)}
                className="min-h-[80px] font-mono text-sm resize-y focus-visible:ring-sky-500"
              />
              
              {/* Preview Email yang Lolos Filter */}
              {detectedEmails.length > 0 && (
                <div className="rounded-lg border border-dashed p-2 bg-zinc-50">
                  <div className="flex flex-wrap gap-1.5">
                    {detectedEmails.map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      >
                        <Mail className="h-2.5 w-2.5" />
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {emailRaw && extractEmails(emailRaw).length > detectedEmails.length && (
                <p className="text-[9px] text-red-500 font-medium">
                  * Beberapa email diabaikan (domain tidak sesuai)
                </p>
              )}
            </div>

            {/* Value Description - Multiple Inputs */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Value Description</Label>
              <p className="text-[10px] text-zinc-500">Tambahkan deskripsi nilai program (opsional)</p>
              <div className="space-y-2">
                {valueDescriptions.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Value description ${index + 1}`}
                      value={value}
                      onChange={(e) => {
                        const newValues = [...valueDescriptions];
                        newValues[index] = e.target.value;
                        setValueDescriptions(newValues);
                      }}
                      className="flex-1"
                    />
                    {valueDescriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newValues = valueDescriptions.filter((_, i) => i !== index);
                          setValueDescriptions(newValues.length > 0 ? newValues : [""]);
                        }}
                        className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValueDescriptions([...valueDescriptions, ""])}
                  className="w-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Value Description
                </Button>
              </div>
            </div>

            {/* Value Benefit - Multiple Inputs */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Value Benefit</Label>
              <p className="text-[10px] text-zinc-500">Tambahkan benefit program (opsional)</p>
              <div className="space-y-2">
                {valueBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Benefit ${index + 1}`}
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...valueBenefits];
                        newBenefits[index] = e.target.value;
                        setValueBenefits(newBenefits);
                      }}
                      className="flex-1"
                    />
                    {valueBenefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newBenefits = valueBenefits.filter((_, i) => i !== index);
                          setValueBenefits(newBenefits.length > 0 ? newBenefits : [""]);
                        }}
                        className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValueBenefits([...valueBenefits, ""])}
                  className="w-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Benefit
                </Button>
              </div>
            </div>

            {/* Value Guide - Multiple Inputs */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Value Guide</Label>
              <p className="text-[10px] text-zinc-500">Tambahkan panduan program (opsional)</p>
              <div className="space-y-2">
                {valueGuides.map((guide, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Guide ${index + 1}`}
                      value={guide}
                      onChange={(e) => {
                        const newGuides = [...valueGuides];
                        newGuides[index] = e.target.value;
                        setValueGuides(newGuides);
                      }}
                      className="flex-1"
                    />
                    {valueGuides.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newGuides = valueGuides.filter((_, i) => i !== index);
                          setValueGuides(newGuides.length > 0 ? newGuides : [""]);
                        }}
                        className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValueGuides([...valueGuides, ""])}
                  className="w-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Guide
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-gray-700">
                Required Data from Applicant
              </Label>
              
              {/* 3 Input Fields in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Alphanumeric Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-sky-600">
                    <Type className="h-3.5 w-3.5" />
                    <span>Text (Alphanumeric)</span>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'alphanumeric')}
                      placeholder="Contoh: Nama, Alamat..."
                      className="text-sm h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAlphanumericTag}
                      className="h-9 px-3 text-sky-600 border-sky-200 hover:bg-sky-50"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Numeric Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Number (Numeric)</span>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      value={numericTagInput}
                      onChange={(e) => setNumericTagInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'numeric')}
                      placeholder="Contoh: Usia, Jumlah..."
                      className="text-sm h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNumericTag}
                      className="h-9 px-3 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Currency Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Currency (Rupiah)</span>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      value={currencyTagInput}
                      onChange={(e) => setCurrencyTagInput(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'currency')}
                      placeholder="Contoh: Gaji, Budget..."
                      className="text-sm h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCurrencyTag}
                      className="h-9 px-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sortable Result List */}
              {parameterItems.length > 0 && (
                <div className="rounded-xl border border-dashed p-3 bg-zinc-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Parameter Terdaftar (Drag untuk urutkan)
                    </p>
                    <span className="text-[10px] font-medium text-zinc-500 bg-white px-2 py-0.5 rounded-full border">
                      {parameterItems.length} item
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parameterItems.map((item, idx) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-1.5 ${getTypeColor(item.type)} border px-2 py-1.5 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                          draggedItem === item.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <GripVertical className="h-3 w-3 opacity-50" />
                        <span className="bg-white/50 rounded px-1 text-[10px] font-bold">{idx + 1}</span>
                        {getTypeIcon(item.type)}
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeParameterItem(item.id)}
                          className="hover:text-red-500 transition-colors ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 italic">
                Tekan Enter atau klik + untuk menambah. Drag & drop untuk mengubah urutan.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-zinc-50 p-3">
              <input
                id="p-status"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.status}
                onChange={(e) => set("status", e.target.checked)}
              />
              <Label htmlFor="p-status" className="font-bold cursor-pointer text-sm">
                Published / Active
              </Label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
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