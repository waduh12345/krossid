"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetProgramLearningQuizByIdQuery,
  useCreateProgramLearningQuizMutation,
  useUpdateProgramLearningQuizMutation,
} from "@/services/programs/learning-quiz.service";
import type { ProgramLearningQuizPayload } from "@/services/programs/learning-quiz.service";
import { useGetProgramLearningsQuery } from "@/services/programs/learning.service";
import SunRichText from "@/components/ui/rich-text";
import Swal from "sweetalert2";
import { X, Loader2, Search, ChevronDown, Check, ImagePlus, Trash2 } from "lucide-react";
import type { ProgramLearningQuiz } from "@/types/programs/learning-quiz";

const STORAGE_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/api\/v\d+$/,
  ""
);

type ImageKey =
  | "question_image"
  | "option_a_image"
  | "option_b_image"
  | "option_c_image"
  | "option_d_image"
  | "option_e_image";

type ImageFiles = Record<ImageKey, File | null>;
type ImageRemoves = Record<ImageKey, boolean>;

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
  option_e: string;
  correct_option: ProgramLearningQuiz["correct_option"];
  status: boolean;
};

const CORRECT_OPTIONS: ProgramLearningQuiz["correct_option"][] = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

function ImageField({
  imageKey,
  previewUrl,
  onSelect,
  onRemove,
}: {
  imageKey: ImageKey;
  previewUrl: string | null;
  onSelect: (key: ImageKey, file: File | null) => void;
  onRemove: (key: ImageKey) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {previewUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="preview"
            className="h-20 w-20 rounded-md border object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(imageKey)}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-sky-400 hover:text-sky-600">
          <ImagePlus className="h-4 w-4" />
          Upload Gambar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onSelect(imageKey, file);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

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
      option_e: detail?.option_e ?? "",
      correct_option: detail?.correct_option ?? "A",
      status: detail?.status === 1 || detail?.status === true || !isEdit,
    }),
    [detail, isEdit]
  );

  const emptyImages: ImageFiles = {
    question_image: null,
    option_a_image: null,
    option_b_image: null,
    option_c_image: null,
    option_d_image: null,
    option_e_image: null,
  };
  const emptyRemoves: ImageRemoves = {
    question_image: false,
    option_a_image: false,
    option_b_image: false,
    option_c_image: false,
    option_d_image: false,
    option_e_image: false,
  };

  const [form, setForm] = useState<FormState>(initial);
  const [imageFiles, setImageFiles] = useState<ImageFiles>(emptyImages);
  const [imageRemoves, setImageRemoves] = useState<ImageRemoves>(emptyRemoves);
  const [learningSearch, setLearningSearch] = useState("");
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredLearnings = useMemo(() => {
    if (!learningSearch.trim()) return learnings;
    const q = learningSearch.toLowerCase();
    return learnings.filter((l) => l.title.toLowerCase().includes(q));
  }, [learnings, learningSearch]);

  const selectedLearning = useMemo(
    () => learnings.find((l) => l.id === form.program_learning_id),
    [learnings, form.program_learning_id]
  );

  useEffect(() => {
    if (open) {
      setForm(initial);
      setImageFiles(emptyImages);
      setImageRemoves(emptyRemoves);
      setLearningSearch("");
      setLearningDropdownOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setLearningDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function existingImageUrl(key: ImageKey): string | null {
    if (imageRemoves[key]) return null;
    const filename = detail?.[key];
    if (!filename) return null;
    return `${STORAGE_BASE}/storage/quiz-images/${filename}`;
  }

  function previewUrl(key: ImageKey): string | null {
    const file = imageFiles[key];
    if (file) return URL.createObjectURL(file);
    return existingImageUrl(key);
  }

  function handleImageSelect(key: ImageKey, file: File | null) {
    setImageFiles((prev) => ({ ...prev, [key]: file }));
    if (file) setImageRemoves((prev) => ({ ...prev, [key]: false }));
  }

  function handleImageRemove(key: ImageKey) {
    setImageFiles((prev) => ({ ...prev, [key]: null }));
    setImageRemoves((prev) => ({ ...prev, [key]: true }));
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

    const payload: ProgramLearningQuizPayload = {
      program_learning_id: form.program_learning_id,
      nomor: Number(form.nomor) || 0,
      question: form.question.trim(),
      option_a: form.option_a.trim() || null,
      option_b: form.option_b.trim() || null,
      option_c: form.option_c.trim() || null,
      option_d: form.option_d.trim() || null,
      option_e: form.option_e.trim() || null,
      correct_option: form.correct_option,
      status: form.status ? 1 : 0,
      ...imageFiles,
      question_image_remove: imageRemoves.question_image,
      option_a_image_remove: imageRemoves.option_a_image,
      option_b_image_remove: imageRemoves.option_b_image,
      option_c_image_remove: imageRemoves.option_c_image,
      option_d_image_remove: imageRemoves.option_d_image,
      option_e_image_remove: imageRemoves.option_e_image,
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
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setLearningDropdownOpen((prev) => !prev)
                      }
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <span
                        className={
                          selectedLearning
                            ? "truncate text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedLearning?.title ?? "— Pilih Learning —"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </button>

                    {learningDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
                        <div className="flex items-center border-b px-3 py-2">
                          <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                          <input
                            type="text"
                            value={learningSearch}
                            onChange={(e) =>
                              setLearningSearch(e.target.value)
                            }
                            placeholder="Cari learning..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                            autoFocus
                          />
                        </div>
                        <ul className="max-h-52 overflow-y-auto py-1">
                          {filteredLearnings.length === 0 ? (
                            <li className="px-3 py-2 text-center text-sm text-gray-400">
                              Tidak ditemukan
                            </li>
                          ) : (
                            filteredLearnings.map((l) => (
                              <li key={l.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    set("program_learning_id", l.id);
                                    setLearningSearch("");
                                    setLearningDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sky-50 ${
                                    form.program_learning_id === l.id
                                      ? "bg-sky-50 font-medium text-sky-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {form.program_learning_id === l.id && (
                                    <Check className="h-4 w-4 shrink-0 text-sky-600" />
                                  )}
                                  <span className="truncate">{l.title}</span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
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
                <ImageField
                  imageKey="question_image"
                  previewUrl={previewUrl("question_image")}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {(
                  [
                    { key: "option_a", label: "Option A", formKey: "option_a" as const, imageKey: "option_a_image" as ImageKey },
                    { key: "option_b", label: "Option B", formKey: "option_b" as const, imageKey: "option_b_image" as ImageKey },
                    { key: "option_c", label: "Option C", formKey: "option_c" as const, imageKey: "option_c_image" as ImageKey },
                    { key: "option_d", label: "Option D", formKey: "option_d" as const, imageKey: "option_d_image" as ImageKey },
                    { key: "option_e", label: "Option E", formKey: "option_e" as const, imageKey: "option_e_image" as ImageKey },
                  ] as const
                ).map((opt) => (
                  <div key={opt.key} className="space-y-2">
                    <Label className="font-semibold text-gray-700">
                      {opt.label}
                    </Label>
                    <SunRichText
                      value={form[opt.formKey]}
                      onChange={(html) => set(opt.formKey, html)}
                      placeholder={`Opsi ${opt.key.slice(-1).toUpperCase()}...`}
                      minHeight={100}
                    />
                    <ImageField
                      imageKey={opt.imageKey}
                      previewUrl={previewUrl(opt.imageKey)}
                      onSelect={handleImageSelect}
                      onRemove={handleImageRemove}
                    />
                  </div>
                ))}
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
