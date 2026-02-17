"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetProgramLearningByIdQuery,
  useCreateProgramLearningMutation,
  useUpdateProgramLearningMutation,
} from "@/services/programs/learning.service";
import { useGetProgramsQuery } from "@/services/programs/programs.service";
import { useGetProgramLearningCategoriesQuery } from "@/services/programs/learning-category.service";
import SunRichText from "@/components/ui/rich-text";
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
  program_learning_category_id: number | null;
  title: string;
  description: string;
  nomor: number;
  file_pdf: string;
  link_youtube: string;
  file_video: string;
  quiz_time_limit_minutes: number | null;
  quiz_minimum_score_percent: number | null;
  status: boolean;
};

export default function LearningForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetProgramLearningByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const { data: programsResp } = useGetProgramsQuery({
    page: 1,
    paginate: 500,
  });
  const programs = useMemo(() => programsResp?.data ?? [], [programsResp]);

  const { data: categoriesResp } = useGetProgramLearningCategoriesQuery({
    page: 1,
    paginate: 500,
  });
  const categories = useMemo(
    () => categoriesResp?.data ?? [],
    [categoriesResp]
  );

  const [createItem, { isLoading: creating }] =
    useCreateProgramLearningMutation();
  const [updateItem, { isLoading: updating }] =
    useUpdateProgramLearningMutation();

  const initial: FormState = useMemo(
    () => ({
      program_id: detail?.program_id ?? null,
      program_learning_category_id:
        detail?.program_learning_category_id ?? null,
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      nomor: typeof detail?.nomor === "number" ? detail.nomor : 0,
      file_pdf: detail?.file_pdf ?? "",
      link_youtube: detail?.link_youtube ?? "",
      file_video: detail?.file_video ?? "",
      quiz_time_limit_minutes: detail?.quiz_time_limit_minutes ?? null,
      quiz_minimum_score_percent: detail?.quiz_minimum_score_percent ?? null,
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

    if (form.program_learning_category_id == null) {
      await Swal.fire({
        icon: "warning",
        title: "Learning category is required",
      });
      return;
    }

    const payload = {
      program_id: form.program_id,
      program_learning_category_id: form.program_learning_category_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      nomor: Number(form.nomor) || 0,
      file_pdf: form.file_pdf.trim() || null,
      link_youtube: form.link_youtube.trim() || null,
      file_video: form.file_video.trim() || null,
      quiz_time_limit_minutes: form.quiz_time_limit_minutes,
      quiz_minimum_score_percent: form.quiz_minimum_score_percent,
      status: form.status ? 1 : 0,
    };

    try {
      if (isEdit && id) {
        await updateItem({ id, payload }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning updated successfully",
        });
      } else {
        await createItem(payload).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning created successfully",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Learning" : "Add Learning"}
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

        {/* Body - scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isFetching && isEdit ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-2">Loading data...</p>
            </div>
          ) : (
            <form
              id="learning-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Program</Label>
                  <select
                    value={form.program_id ?? ""}
                    onChange={(e) =>
                      set(
                        "program_id",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
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
                  <Label className="font-semibold text-gray-700">
                    Learning Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={form.program_learning_category_id ?? ""}
                    onChange={(e) =>
                      set(
                        "program_learning_category_id",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <option value="">— Pilih Kategori —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Judul materi learning"
                    maxLength={200}
                    className="focus-visible:ring-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Nomor Urut
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.nomor}
                    onChange={(e) =>
                      set("nomor", Number(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="focus-visible:ring-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">
                  Description
                </Label>
                <SunRichText
                  value={form.description}
                  onChange={(html) => set("description", html)}
                  placeholder="Tulis deskripsi materi (rich text)..."
                  minHeight={280}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Waktu Quiz (menit)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.quiz_time_limit_minutes ?? ""}
                    onChange={(e) =>
                      set(
                        "quiz_time_limit_minutes",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    placeholder="Kosongkan = tanpa batas"
                    className="focus-visible:ring-sky-500"
                  />
                  <p className="text-xs text-gray-400">
                    Batas waktu pengerjaan quiz (menit). Kosongkan jika tidak dibatasi.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Nilai Minimum Lulus (%)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.quiz_minimum_score_percent ?? ""}
                    onChange={(e) =>
                      set(
                        "quiz_minimum_score_percent",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    placeholder="Kosongkan = default 60%"
                    className="focus-visible:ring-sky-500"
                  />
                  <p className="text-xs text-gray-400">
                    Persentase minimum untuk lulus (0–100). Kosongkan = default 60%.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Link PDF / File PDF
                  </Label>
                  <Input
                    value={form.file_pdf}
                    onChange={(e) => set("file_pdf", e.target.value)}
                    placeholder="URL atau path file PDF"
                    className="focus-visible:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Link YouTube
                  </Label>
                  <Input
                    value={form.link_youtube}
                    onChange={(e) => set("link_youtube", e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="focus-visible:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Link Video / File Video
                  </Label>
                  <Input
                    value={form.file_video}
                    onChange={(e) => set("file_video", e.target.value)}
                    placeholder="URL atau path file video"
                    className="focus-visible:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                <input
                  id="status"
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  checked={form.status}
                  onChange={(e) => set("status", e.target.checked)}
                />
                <Label
                  htmlFor="status"
                  className="cursor-pointer font-bold text-gray-700"
                >
                  Active
                </Label>
              </div>
            </form>
          )}
        </div>

        {/* Footer - fixed at bottom of modal */}
        {!isFetching && (
          <div className="shrink-0 border-t px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                form="learning-form"
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
          </div>
        )}
      </div>
    </div>
  );
}
