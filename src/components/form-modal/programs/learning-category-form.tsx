"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetProgramLearningCategoryByIdQuery,
  useCreateProgramLearningCategoryMutation,
  useUpdateProgramLearningCategoryMutation,
} from "@/services/programs/learning-category.service";
import { useGetProgramsQuery } from "@/services/programs/programs.service";
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
  program_id: number | null;
  title: string;
  description: string;
  nomor: number;
  status: boolean;
};

export default function LearningCategoryForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetProgramLearningCategoryByIdQuery(
    id ?? 0,
    { skip: !isEdit || !id }
  );

  const { data: programsResp } = useGetProgramsQuery({
    page: 1,
    paginate: 500,
  });
  const programs = useMemo(() => programsResp?.data ?? [], [programsResp]);

  const [createItem, { isLoading: creating }] =
    useCreateProgramLearningCategoryMutation();
  const [updateItem, { isLoading: updating }] =
    useUpdateProgramLearningCategoryMutation();

  const initial: FormState = useMemo(
    () => ({
      program_id: detail?.program_id ?? null,
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      nomor: typeof detail?.nomor === "number" ? detail.nomor : 0,
      status: detail?.status === 1 || detail?.status === true || !isEdit,
    }),
    [detail, isEdit]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      await Swal.fire({ icon: "warning", title: "Title is required" });
      return;
    }

    if (form.title.length < 2) {
      await Swal.fire({
        icon: "warning",
        title: "Title must be at least 2 characters",
      });
      return;
    }

    const payload = {
      program_id: form.program_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      nomor: Number(form.nomor) || 0,
      status: form.status ? 1 : 0,
    };

    try {
      if (isEdit && id) {
        await updateItem({ id, payload }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning category updated successfully",
        });
      } else {
        await createItem(payload).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning category created successfully",
        });
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Failed to process the request.";
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
      ) {
        errorMessage =
          (err.data as { message?: string }).message || errorMessage;
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
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Learning Category" : "Add Learning Category"}
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

        {isFetching && isEdit ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="mt-2">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Program</Label>
              <select
                value={form.program_id ?? ""}
                onChange={(e) =>
                  set(
                    "program_id",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <option value="">— Pilih Program (opsional) —</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Modul 1: Dasar-dasar"
                maxLength={200}
                className="focus-visible:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Deskripsi kategori learning..."
                rows={4}
                className="min-h-[100px] resize-none focus-visible:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Nomor Urut</Label>
              <Input
                type="number"
                min={0}
                value={form.nomor}
                onChange={(e) => set("nomor", Number(e.target.value) || 0)}
                placeholder="0"
                className="focus-visible:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
              <input
                id="status"
                type="checkbox"
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                checked={form.status}
                onChange={(e) => set("status", e.target.checked)}
              />
              <Label htmlFor="status" className="cursor-pointer font-bold text-gray-700">
                Active
              </Label>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700"
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
