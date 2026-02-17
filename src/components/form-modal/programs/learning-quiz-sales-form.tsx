"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetProgramLearningQuizSaleByIdQuery,
  useUpdateProgramLearningQuizSaleMutation,
} from "@/services/programs/learning-quiz-sales.service";
import Swal from "sweetalert2";
import { X, Loader2, Award, CheckCircle2, Calendar } from "lucide-react";

type Props = {
  open: boolean;
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string;
};

function toInputDateTime(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LearningQuizSalesForm({
  open,
  id,
  onClose,
  onSuccess,
}: Props) {
  const { data: detail, isFetching } = useGetProgramLearningQuizSaleByIdQuery(
    id ?? 0,
    { skip: !open || !id }
  );

  const [updateItem, { isLoading: updating }] =
    useUpdateProgramLearningQuizSaleMutation();

  const initial: FormState = useMemo(
    () => ({
      score: detail?.score ?? 0,
      total_questions: detail?.total_questions ?? 0,
      passed: detail?.passed ?? false,
      completed_at: toInputDateTime(detail?.completed_at ?? null),
    }),
    [detail]
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

    if (form.total_questions < 0 || form.score < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Score dan total questions tidak boleh negatif",
      });
      return;
    }

    if (form.score > form.total_questions && form.total_questions > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Score tidak boleh lebih besar dari total questions",
      });
      return;
    }

    if (!id) return;

    try {
      await updateItem({
        id,
        payload: {
          score: form.score,
          total_questions: form.total_questions,
          passed: form.passed,
          completed_at: form.completed_at || null,
        },
      }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Hasil quiz berhasil diperbarui",
      });
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Gagal memperbarui data.";
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
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            Edit Hasil Quiz
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

        <div className="px-6 py-4">
          {detail && (
            <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {detail.program_learning?.title ?? `Learning #${detail.program_learning_id}`}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {detail.sales?.name} ({detail.sales?.email})
              </p>
            </div>
          )}

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-2">Memuat...</p>
            </div>
          ) : (
            <form
              id="learning-quiz-sales-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-gray-700">
                    <Award className="h-4 w-4 text-amber-500" />
                    Score
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.score}
                    onChange={(e) =>
                      set("score", Number(e.target.value) || 0)
                    }
                    className="focus-visible:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Total Soal
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.total_questions}
                    onChange={(e) =>
                      set("total_questions", Number(e.target.value) || 0)
                    }
                    className="focus-visible:ring-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold text-gray-700">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Selesai Pada
                </Label>
                <Input
                  type="datetime-local"
                  value={form.completed_at}
                  onChange={(e) => set("completed_at", e.target.value)}
                  className="focus-visible:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3 dark:bg-gray-800/50">
                <input
                  id="quiz-passed"
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={form.passed}
                  onChange={(e) => set("passed", e.target.checked)}
                />
                <Label
                  htmlFor="quiz-passed"
                  className="flex cursor-pointer items-center gap-2 font-bold text-gray-700"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Lulus
                </Label>
              </div>
            </form>
          )}
        </div>

        {!isFetching && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              form="learning-quiz-sales-form"
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
