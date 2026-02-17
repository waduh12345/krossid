"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePackageMutation,
  useGetPackageByIdQuery,
  useUpdatePackageMutation,
} from "@/services/package/package.service";
import type { PackageStorePayload } from "@/types/package/package";
import Swal from "sweetalert2";
import { X, Loader2, ImageIcon } from "lucide-react";

const STORAGE_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/api\/v\d+$/,
  ""
);

function imgUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/")
    ? `${STORAGE_BASE}${path}`
    : `${STORAGE_BASE}/${path}`;
}

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  number: number;
  price_month: number;
  price_year: number;
  price_discount_month: string;
  price_discount_year: string;
  status: number;
  max_users: string;
  max_campaigns: string;
};

interface ApiError {
  data?: { message?: string };
}

export default function PackageForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching: fetchingDetail } = useGetPackageByIdQuery(
    id ?? 0,
    { skip: !isEdit || !id }
  );

  const [createPackage, { isLoading: creating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: updating }] = useUpdatePackageMutation();

  const initial: FormState = useMemo(
    () => ({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      number: detail?.number ?? 0,
      price_month: detail?.price_month ?? 0,
      price_year: detail?.price_year ?? 0,
      price_discount_month:
        detail?.price_discount_month != null
          ? String(detail.price_discount_month)
          : "",
      price_discount_year:
        detail?.price_discount_year != null
          ? String(detail.price_discount_year)
          : "",
      status:
        detail?.status === 1 || detail?.status === true ? 1 : 0,
      max_users:
        detail?.max_users != null ? String(detail.max_users) : "",
      max_campaigns:
        detail?.max_campaigns != null ? String(detail.max_campaigns) : "",
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      if (isEdit && detail?.image) {
        setImagePreview(imgUrl(detail.image));
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [initial, open, isEdit, detail]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
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
    if (!form.name.trim()) {
      await Swal.fire({ icon: "warning", title: "Name is required" });
      return;
    }

    const payload: PackageStorePayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      number: Number(form.number) || 0,
      price_month: Number(form.price_month) || 0,
      price_year: Number(form.price_year) || 0,
      price_discount_month: form.price_discount_month
        ? Number(form.price_discount_month)
        : null,
      price_discount_year: form.price_discount_year
        ? Number(form.price_discount_year)
        : null,
      status: form.status,
      max_users: form.max_users ? Number(form.max_users) : null,
      max_campaigns: form.max_campaigns ? Number(form.max_campaigns) : null,
      image: imageFile ?? undefined,
    };

    try {
      if (isEdit && id) {
        await updatePackage({ id, payload }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Package Updated",
        });
      } else {
        await createPackage(payload).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Package Created",
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as ApiError;
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message ?? "Request failed",
      });
    }
  }

  if (!open) return null;

  const loading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl max-h-[98vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Package" : "Create New Package"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {fetchingDetail ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Package name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Description"
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image</Label>
                <div className="flex items-start gap-4">
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
                  <div className="flex flex-col gap-1">
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-xs h-8"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] ?? null)
                      }
                    />
                    <span className="text-[10px] text-zinc-400">
                      JPG, PNG, WebP. Max 2MB.
                    </span>
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
              <div className="space-y-2">
                <Label htmlFor="number">Number (order)</Label>
                <Input
                  id="number"
                  type="number"
                  min={0}
                  value={form.number}
                  onChange={(e) => set("number", e.target.valueAsNumber || 0)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => set("status", Number(e.target.value))}
                  className="h-9 w-full rounded-xl border bg-background px-3 text-sm"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_month">Price (Month)</Label>
                <Input
                  id="price_month"
                  type="number"
                  min={0}
                  value={form.price_month}
                  onChange={(e) =>
                    set("price_month", e.target.valueAsNumber ?? 0)
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_year">Price (Year)</Label>
                <Input
                  id="price_year"
                  type="number"
                  min={0}
                  value={form.price_year}
                  onChange={(e) =>
                    set("price_year", e.target.valueAsNumber ?? 0)
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_discount_month">Discount (Month)</Label>
                <Input
                  id="price_discount_month"
                  type="number"
                  min={0}
                  value={form.price_discount_month}
                  onChange={(e) =>
                    set("price_discount_month", e.target.value)
                  }
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_discount_year">Discount (Year)</Label>
                <Input
                  id="price_discount_year"
                  type="number"
                  min={0}
                  value={form.price_discount_year}
                  onChange={(e) =>
                    set("price_discount_year", e.target.value)
                  }
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_users">Max Users</Label>
                <Input
                  id="max_users"
                  type="number"
                  min={0}
                  value={form.max_users}
                  onChange={(e) => set("max_users", e.target.value)}
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_campaigns">Max Campaigns</Label>
                <Input
                  id="max_campaigns"
                  type="number"
                  min={0}
                  value={form.max_campaigns}
                  onChange={(e) => set("max_campaigns", e.target.value)}
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
