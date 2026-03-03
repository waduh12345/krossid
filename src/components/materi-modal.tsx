"use client";

import { useState } from "react";
import {
  useGetMaterisQuery,
  useGetMateriDetailQuery,
  useGetMateriQuizzesQuery,
  useLazyGetMateriQuizzesQuery,
} from "@/services/programs/materi.service";
import {
  X,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

const LEVEL_MAP: Record<number, { label: string; color: string; bg: string; ring: string }> = {
  1: { label: "Low", color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  2: { label: "Medium", color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  3: { label: "Expert", color: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
};

/* ==================== QUIZ LIST VIEW ==================== */
function QuizListView({
  programId,
  materiId,
  level,
  onBack,
}: {
  programId: number;
  materiId: number;
  level: number;
  onBack: () => void;
}) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isFetching } = useGetMateriQuizzesQuery({
    programId,
    materiId,
    level,
    paginate: 10,
    page,
  });

  const [fetchAllQuizzes] = useLazyGetMateriQuizzesQuery();

  const quizzes = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;
  const lvl = LEVEL_MAP[level] ?? LEVEL_MAP[1];

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const result = await fetchAllQuizzes({
        programId,
        materiId,
        level,
        paginate: 9999,
        page: 1,
      }).unwrap();

      if (!result.data.length) {
        setIsExporting(false);
        return;
      }

      const excelData = result.data.map((q) => ({
        No: q.nomor,
        Pertanyaan: q.question,
        "Opsi A": q.option_a,
        "Opsi B": q.option_b,
        "Opsi C": q.option_c,
        "Opsi D": q.option_d,
        "Jawaban Benar": q.correct_option.toUpperCase(),
        "Penjelasan A": q.explanation_a,
        "Penjelasan B": q.explanation_b,
        "Penjelasan C": q.explanation_c,
        "Penjelasan D": q.explanation_d,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 5 },   // No
        { wch: 60 },  // Pertanyaan
        { wch: 40 },  // Opsi A
        { wch: 40 },  // Opsi B
        { wch: 40 },  // Opsi C
        { wch: 40 },  // Opsi D
        { wch: 15 },  // Jawaban Benar
        { wch: 50 },  // Penjelasan A
        { wch: 50 },  // Penjelasan B
        { wch: 50 },  // Penjelasan C
        { wch: 50 },  // Penjelasan D
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Level ${lvl.label}`);
      XLSX.writeFile(workbook, `Quiz_Level_${lvl.label}_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-slate-50">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-gray-900">Quiz — Level {lvl.label}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{total} soal</p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={isExporting || total === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors ring-1 ring-inset ring-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export Excel
        </button>
      </div>

      {/* Quiz Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {isFetching && !quizzes.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-sm">Loading quiz...</span>
          </div>
        ) : quizzes.length ? (
          quizzes.map((quiz) => {
            const isOpen = expanded === quiz.id;
            const options = [
              { key: "a", text: quiz.option_a, explanation: quiz.explanation_a },
              { key: "b", text: quiz.option_b, explanation: quiz.explanation_b },
              { key: "c", text: quiz.option_c, explanation: quiz.explanation_c },
              { key: "d", text: quiz.option_d, explanation: quiz.explanation_d },
            ];

            return (
              <div
                key={quiz.id}
                className="rounded-xl border bg-white shadow-sm overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : quiz.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50/60 transition-colors"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    {quiz.nomor}
                  </span>
                  <p className="flex-1 text-sm text-gray-800 leading-relaxed">
                    {quiz.question}
                  </p>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  )}
                </button>

                {/* Expanded Options + Explanations */}
                {isOpen && (
                  <div className="border-t px-4 py-3 space-y-2 bg-gray-50/40">
                    {options.map((opt) => {
                      const isCorrect =
                        quiz.correct_option.toLowerCase() === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`rounded-lg border p-3 ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50/70"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {opt.key.toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">{opt.text}</p>
                              {opt.explanation && (
                                <div
                                  className={`mt-1.5 flex items-start gap-1.5 text-xs ${
                                    isCorrect
                                      ? "text-emerald-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span>{opt.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm">Belum ada soal quiz</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-gray-500">
          <span>
            Halaman {page} dari {lastPage} ({total} soal)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== MATERI DETAIL VIEW ==================== */
function MateriDetailView({
  programId,
  materiId,
  onBack,
  onSelectLevel,
}: {
  programId: number;
  materiId: number;
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}) {
  const { data, isFetching } = useGetMateriDetailQuery({ programId, materiId });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-slate-50">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-gray-900">Detail Materi</h3>
          </div>
          {data && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {data.file_pdf}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-sm">Loading detail...</span>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* File Info Card */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {data.file_pdf}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>Total Quiz: {data.quizzes_count} soal</span>
                    <span>|</span>
                    <span>Soal per level: {data.soal_quiz}</span>
                  </div>
                </div>
                <a
                  href={data.file_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors ring-1 ring-inset ring-blue-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka PDF
                </a>
              </div>

              {/* Level Badges */}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-gray-500">Level:</span>
                {data.level.map((l) => {
                  const lvl = LEVEL_MAP[l] ?? LEVEL_MAP[1];
                  return (
                    <span
                      key={l}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${lvl.bg} ${lvl.color} ${lvl.ring}`}
                    >
                      {lvl.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quiz Summary per Level */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Quiz per Level
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.quiz_summary.map((qs) => {
                  const lvl = LEVEL_MAP[qs.level] ?? LEVEL_MAP[1];
                  return (
                    <button
                      key={qs.level}
                      onClick={() => onSelectLevel(qs.level)}
                      className={`group rounded-xl border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${lvl.bg} ring-1 ring-inset ${lvl.ring}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${lvl.color}`}
                        >
                          {lvl.label}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 ${lvl.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                        />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {qs.total_soal}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">soal quiz</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ==================== MATERI LIST VIEW ==================== */
function MateriListView({
  programId,
  onSelectMateri,
}: {
  programId: number;
  onSelectMateri: (materiId: number) => void;
}) {
  const { data, isFetching } = useGetMaterisQuery(programId);
  const materis = data ?? [];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <span className="text-sm">Loading materi...</span>
        </div>
      ) : materis.length ? (
        <div className="space-y-3">
          {materis.map((materi, idx) => (
            <button
              key={materi.id}
              onClick={() => onSelectMateri(materi.id)}
              className="w-full group rounded-xl border bg-white p-4 text-left shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      #{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {materi.file_pdf}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {materi.level.map((l) => {
                      const lvl = LEVEL_MAP[l] ?? LEVEL_MAP[1];
                      return (
                        <span
                          key={l}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${lvl.bg} ${lvl.color} ${lvl.ring}`}
                        >
                          {lvl.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{materi.soal_quiz} soal/level</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-indigo-600">
                      {materi.quizzes_count} total quiz
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-2" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FileText className="h-8 w-8 mb-2 opacity-50" />
          <span className="text-sm">Belum ada materi</span>
        </div>
      )}
    </div>
  );
}

/* ==================== MAIN MODAL ==================== */

type ModalView =
  | { type: "list" }
  | { type: "detail"; materiId: number }
  | { type: "quiz"; materiId: number; level: number };

export default function MateriModal({
  programId,
  programTitle,
  onClose,
}: {
  programId: number;
  programTitle: string;
  onClose: () => void;
}) {
  const [view, setView] = useState<ModalView>({ type: "list" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full h-full bg-white flex flex-col overflow-hidden sm:m-4 sm:rounded-2xl sm:shadow-2xl sm:h-[calc(100vh-2rem)]">
        {/* Top Header (only on list view) */}
        {view.type === "list" && (
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Materi — {programTitle}
                </h3>
                <p className="text-xs text-gray-500">
                  Daftar materi & quiz program
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Close button for detail/quiz views */}
        {view.type !== "list" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}

        {/* Views */}
        {view.type === "list" && (
          <MateriListView
            programId={programId}
            onSelectMateri={(materiId) =>
              setView({ type: "detail", materiId })
            }
          />
        )}

        {view.type === "detail" && (
          <MateriDetailView
            programId={programId}
            materiId={view.materiId}
            onBack={() => setView({ type: "list" })}
            onSelectLevel={(level) =>
              setView({ type: "quiz", materiId: view.materiId, level })
            }
          />
        )}

        {view.type === "quiz" && (
          <QuizListView
            programId={programId}
            materiId={view.materiId}
            level={view.level}
            onBack={() =>
              setView({ type: "detail", materiId: view.materiId })
            }
          />
        )}
      </div>
    </div>
  );
}
