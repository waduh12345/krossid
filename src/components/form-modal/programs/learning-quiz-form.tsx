"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetProgramLearningQuizByIdQuery,
  useCreateProgramLearningQuizMutation,
  useUpdateProgramLearningQuizMutation,
} from "@/services/programs/learning-quiz.service";
import { useGetProgramLearningsQuery } from "@/services/programs/learning.service";
import SunRichText from "@/components/ui/rich-text";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";
import type { ProgramLearningQuiz } from "@/types/programs/learning-quiz";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  program_learning_id: number | null;
  nomor: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: ProgramLearningQuiz["correct_option"];
  status: boolean;
};

const CORRECT_OPTIONS: ProgramLearningQuiz["correct_option"][] = [
  "A",
  "B",
  "C",
  "D",
];

export default function LearningQuizForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetProgramLearningQuizByIdQuery(
    id ?? 0,
    { skip: !isEdit || !id }
  );

  const { data: learningsResp } = useGetProgramLearningsQuery({
    page: 1,
    paginate: 500,
  });
  const learnings = useMemo(() => learningsResp?.data ?? [], [learningsResp]);

  const [createItem, { isLoading: creating }] =
    useCreateProgramLearningQuizMutation();
  const [updateItem, { isLoading: updating }] =
    useUpdateProgramLearningQuizMutation();

  const initial: FormState = useMemo(
    () => ({
      program_learning_id: detail?.program_learning_id ?? null,
      nomor: typeof detail?.nomor === "number" ? detail.nomor : 0,
      question: detail?.question ?? "",
      option_a: detail?.option_a ?? "",
      option_b: detail?.option_b ?? "",
      option_c: detail?.option_c ?? "",
      option_d: detail?.option_d ?? "",
      correct_option: detail?.correct_option ?? "A",
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

    if (!form.question.trim()) {
      await Swal.fire({ icon: "warning", title: "Question is required" });
      return;
    }

    if (form.program_learning_id == null) {
      await Swal.fire({
        icon: "warning",
        title: "Learning is required",
      });
      return;
    }

    const payload = {
      program_learning_id: form.program_learning_id,
      nomor: Number(form.nomor) || 0,
      question: form.question.trim(),
      option_a: form.option_a.trim() || null,
      option_b: form.option_b.trim() || null,
      option_c: form.option_c.trim() || null,
      option_d: form.option_d.trim() || null,
      correct_option: form.correct_option,
      status: form.status ? 1 : 0,
    };

    try {
      if (isEdit && id) {
        await updateItem({ id, payload }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Quiz updated successfully",
        });
      } else {
        await createItem(payload).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Quiz created successfully",
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
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Quiz" : "Add Quiz"}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isFetching && isEdit ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-2">Loading data...</p>
            </div>
          ) : (
            <form
              id="learning-quiz-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Learning <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={form.program_learning_id ?? ""}
                    onChange={(e) =>
                      set(
                        "program_learning_id",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <option value="">— Pilih Learning —</option>
                    {learnings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
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
                  Question <span className="text-red-500">*</span>
                </Label>
                <SunRichText
                  value={form.question}
                  onChange={(html) => set("question", html)}
                  placeholder="Tulis pertanyaan (rich text)..."
                  minHeight={180}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Option A
                  </Label>
                  <SunRichText
                    value={form.option_a}
                    onChange={(html) => set("option_a", html)}
                    placeholder="Opsi A..."
                    minHeight={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Option B
                  </Label>
                  <SunRichText
                    value={form.option_b}
                    onChange={(html) => set("option_b", html)}
                    placeholder="Opsi B..."
                    minHeight={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Option C
                  </Label>
                  <SunRichText
                    value={form.option_c}
                    onChange={(html) => set("option_c", html)}
                    placeholder="Opsi C..."
                    minHeight={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Option D
                  </Label>
                  <SunRichText
                    value={form.option_d}
                    onChange={(html) => set("option_d", html)}
                    placeholder="Opsi D..."
                    minHeight={100}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Jawaban Benar
                  </Label>
                  <select
                    value={form.correct_option}
                    onChange={(e) =>
                      set(
                        "correct_option",
                        e.target.value as FormState["correct_option"]
                      )
                    }
                    className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    {CORRECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                  <input
                    id="quiz-status"
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    checked={form.status}
                    onChange={(e) => set("status", e.target.checked)}
                  />
                  <Label
                    htmlFor="quiz-status"
                    className="cursor-pointer font-bold text-gray-700"
                  >
                    Active
                  </Label>
                </div>
              </div>
            </form>
          )}
        </div>

        {!isFetching && (
          <div className="shrink-0 border-t px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                form="learning-quiz-form"
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
