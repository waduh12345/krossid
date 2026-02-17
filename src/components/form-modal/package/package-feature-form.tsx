"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePackageFeatureMutation,
  useGetPackageFeatureByIdQuery,
  useUpdatePackageFeatureMutation,
} from "@/services/package/feature.service";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  packageId: number;
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  label: string;
  value: string;
  nomor: number;
};

interface ApiError {
  data?: { message?: string };
}

export default function PackageFeatureForm({
  open,
  mode,
  packageId,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching: fetchingDetail } =
    useGetPackageFeatureByIdQuery(id ?? 0, {
      skip: !isEdit || !id,
    });

  const [createFeature, { isLoading: creating }] =
    useCreatePackageFeatureMutation();
  const [updateFeature, { isLoading: updating }] =
    useUpdatePackageFeatureMutation();

  const initial: FormState = useMemo(
    () => ({
      label: detail?.label ?? "",
      value: detail?.value ?? "",
      nomor: detail?.nomor ?? 0,
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (open) {
      if (isEdit && detail) {
        setForm({
          label: detail.label,
          value: detail.value ?? "",
          nomor: detail.nomor ?? 0,
        });
      } else {
        setForm({ label: "", value: "", nomor: 0 });
      }
    }
  }, [open, isEdit, detail]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) {
      await Swal.fire({ icon: "warning", title: "Label is required" });
      return;
    }

    try {
      if (isEdit && id) {
        await updateFeature({
          id,
          payload: {
            package_id: packageId,
            label: form.label.trim(),
            value: form.value.trim() || null,
            nomor: form.nomor,
          },
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Feature Updated",
        });
      } else {
        await createFeature({
          package_id: packageId,
          label: form.label.trim(),
          value: form.value.trim() || null,
          nomor: form.nomor,
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Feature Created",
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
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Feature" : "Add Feature"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {fetchingDetail ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Feature label"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                placeholder="Optional value"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomor">Order (nomor)</Label>
              <Input
                id="nomor"
                type="number"
                min={0}
                value={form.nomor}
                onChange={(e) => set("nomor", e.target.valueAsNumber ?? 0)}
                className="rounded-xl"
              />
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
