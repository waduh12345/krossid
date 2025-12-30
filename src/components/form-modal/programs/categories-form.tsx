"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this component
import {
    useGetCategoriesByIdQuery,
    useCreateCategoriesMutation,
    useUpdateCategoriesMutation,
} from "@/services/programs/categories.service";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";

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
  status: boolean;
};

export default function CategoriesForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  // Fetch detail if in edit mode
  const { data: detail, isFetching } = useGetCategoriesByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const [createCategories, { isLoading: creating }] = useCreateCategoriesMutation();
  const [updateCategories, { isLoading: updating }] = useUpdateCategoriesMutation();

  const initial: FormState = useMemo(
    () => ({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      status: detail?.status === 1 || detail?.status === true || !isEdit, // Default true for new
    }),
    [detail, isEdit]
  );

  const [form, setForm] = useState<FormState>(initial);

  // Sync form with fetched detail
  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      await Swal.fire({ icon: "warning", title: "Name is required" });
      return;
    }

    if (form.name.length < 3) {
      await Swal.fire({ icon: "warning", title: "Name must be at least 3 characters" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      status: form.status ? 1 : 0,
    };

    try {
      if (isEdit && id) {
        await updateCategories({ id, payload }).unwrap();
        await Swal.fire({ icon: "success", title: "Category updated successfully" });
      } else {
        await createCategories(payload).unwrap();
        await Swal.fire({ icon: "success", title: "Category created successfully" });
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Failed to process the request.";
      if (err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "message" in err.data) {
        errorMessage = (err.data as { message?: string }).message || errorMessage;
      }
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isFetching && isEdit ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="mt-2">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Name */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Category Name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Technology, Health, etc."
                maxLength={50}
                className="focus-visible:ring-sky-500"
              />
            </div>

            {/* Description (Text Editor Style) */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Provide a detailed description of this category..."
                rows={5}
                className="min-h-[120px] resize-none focus-visible:ring-sky-500"
              />
              <p className="text-right text-[11px] text-gray-400">
                {form.description.length} / 500 characters
              </p>
            </div>

            {/* Status Switch */}
            <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
              <input
                id="status"
                type="checkbox"
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.status}
                onChange={(e) => set("status", e.target.checked)}
              />
              <div className="flex flex-col">
                <Label htmlFor="status" className="cursor-pointer font-bold text-gray-700">
                  Active
                </Label>
                <span className="text-xs text-gray-500">
                  Visible to users and available for programs
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3 border-t pt-5">
              <Button type="button" variant="outline" onClick={onClose} className="px-6">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 px-8 font-semibold text-white hover:bg-sky-700"
                disabled={creating || updating}
              >
                {creating || updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}