"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import {
  useGetProgramLearningQuizzesQuery,
  useDeleteProgramLearningQuizMutation,
} from "@/services/programs/learning-quiz.service";
import { useGetProgramLearningsQuery } from "@/services/programs/learning.service";
import type { ProgramLearningQuiz, ProgramLearningQuizListResponse } from "@/types/programs/learning-quiz";
import LearningQuizForm from "@/components/form-modal/programs/learning-quiz-form";
import { ApiError } from "@/lib/utils";

type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

const PER_PAGE = 10;

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim().slice(0, 100);
}

export default function ProgramLearningQuizPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;
  const isSuperadmin = userRole === "superadmin";

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [programLearningId, setProgramLearningId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data, isFetching, refetch } = useGetProgramLearningQuizzesQuery({
    page,
    paginate,
    search: q,
    program_learning_id: programLearningId ?? undefined,
  });

  const listResponse: ProgramLearningQuizListResponse | undefined = data;
  const items: ProgramLearningQuiz[] = useMemo(() => listResponse?.data ?? [], [listResponse]);
  const lastPage = listResponse?.last_page ?? 1;
  const total = listResponse?.total ?? 0;
  const quizTimeLimitMinutes = listResponse?.quiz_time_limit_minutes;
  const quizMinimumScorePercent = listResponse?.quiz_minimum_score_percent;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteItem, { isLoading: deleting }] =
    useDeleteProgramLearningQuizMutation();

  const { data: learningsData } = useGetProgramLearningsQuery({
    page: 1,
    paginate: 500,
  });
  const learnings = useMemo(() => learningsData?.data ?? [], [learningsData]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate, programLearningId]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const result = await refetch();
      const exportData = result.data;
      if (!exportData || exportData.data.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Tidak Ada Data",
          text: "Tidak ada data untuk diekspor.",
        });
        setIsExporting(false);
        return;
      }
      const allItems: ProgramLearningQuiz[] = [...exportData.data];
      const excelData = allItems.map((item) => ({
        ID: item.id,
        "Learning ID": item.program_learning_id,
        Learning: item.program_learning?.title ?? "-",
        "No Urut": item.nomor,
        Question: stripHtml(item.question) || "-",
        "Option A": stripHtml(item.option_a) || "-",
        "Option B": stripHtml(item.option_b) || "-",
        "Option C": stripHtml(item.option_c) || "-",
        "Option D": stripHtml(item.option_d) || "-",
        "Correct": item.correct_option,
        Status: item.status === 1 || item.status === true ? "Active" : "Inactive",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Learning Quiz");
      const maxWidths = [
        { wch: 6 },
        { wch: 12 },
        { wch: 28 },
        { wch: 8 },
        { wch: 38 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 8 },
        { wch: 10 },
      ];
      worksheet["!cols"] = maxWidths;

      const fileName = `Learning_Quiz_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data quiz berhasil diekspor (${allItems.length} data).`,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Export error:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengekspor data.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Quiz?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteItem(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The quiz has been removed.",
      });
      void refetch();
    } catch (err: unknown) {
      const error = err as ApiError;
      await Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error?.data?.message || "Gagal memproses data.",
      });
    }
  }

  return (
    <>
      <SiteHeader title="Program Learning Quiz" />
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search question..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            <select
              className="h-9 rounded-xl border bg-background px-2 text-sm min-w-[180px]"
              value={programLearningId ?? ""}
              onChange={(e) =>
                setProgramLearningId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            >
              <option value="">Semua Learning</option>
              {learnings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-xl border bg-background px-2 text-sm"
              value={paginate}
              onChange={(e) => setPaginate(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setQ("");
                setProgramLearningId(null);
                setPage(1);
                void refetch();
              }}
              title="Reset Filter"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting || total === 0}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </>
              )}
            </Button>

            {isSuperadmin && (
              <Button
                variant="default"
                className="bg-sky-600 hover:bg-sky-700"
                onClick={() => setOpenForm({ mode: "create" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Quiz
              </Button>
            )}
          </div>
        </div>

        {(quizTimeLimitMinutes != null || quizMinimumScorePercent != null) && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-2 text-sm text-sky-800">
            <span className="font-medium">Pengaturan quiz (learning ini):</span>
            {quizTimeLimitMinutes != null && (
              <span className="ml-2">Batas waktu {quizTimeLimitMinutes} menit</span>
            )}
            {quizMinimumScorePercent != null && (
              <span className="ml-2">Nilai minimum lulus {quizMinimumScorePercent}%</span>
            )}
          </div>
        )}

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4 w-14 text-center">ID</th>
                  <th className="px-4 py-4">Learning</th>
                  <th className="px-4 py-4 w-16 text-center">No</th>
                  <th className="px-4 py-4 max-w-[220px]">Question</th>
                  <th className="px-4 py-4 w-20 text-center">Correct</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={7}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-zinc-400 font-mono">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {item.program_learning?.title ?? item.program_learning_id}
                      </td>
                      <td className="px-4 py-3 text-center">{item.nomor}</td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-zinc-700">
                        {stripHtml(item.question) || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                          {item.correct_option}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === 1 || item.status === true ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperadmin ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setOpenForm({ mode: "edit", id: item.id })
                                }
                                className="h-9 w-9 p-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                disabled={deleting}
                                title="Delete"
                                className="h-9 w-9 p-0 bg-white hover:bg-red-500 text-red-500 hover:text-white border border-red-500 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Read Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-zinc-500"
                      colSpan={7}
                    >
                      No quiz found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs font-medium text-zinc-500">
            <div>
              Showing {items.length} of {total} results • Page {page} of{" "}
              {lastPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {isSuperadmin && openForm && (
          <LearningQuizForm
            open
            mode={openForm.mode}
            id={openForm.id}
            onClose={() => setOpenForm(null)}
            onSuccess={() => {
              setOpenForm(null);
              void refetch();
            }}
          />
        )}
      </div>
    </>
  );
}
