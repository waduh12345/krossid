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
  useGetProgramLearningsQuery,
  useDeleteProgramLearningMutation,
} from "@/services/programs/learning.service";
import type { ProgramLearning } from "@/types/programs/learning";
import LearningForm from "@/components/form-modal/programs/learning-form";
import { ApiError } from "@/lib/utils";

type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

const PER_PAGE = 10;

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim().slice(0, 120);
}

export default function ProgramLearningPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;
  const isSuperadmin = userRole === "superadmin";

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data, isFetching, refetch } = useGetProgramLearningsQuery({
    page,
    paginate,
    search: q,
  });

  const items: ProgramLearning[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteItem, { isLoading: deleting }] =
    useDeleteProgramLearningMutation();

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

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
      const allItems: ProgramLearning[] = [...exportData.data];
      const excelData = allItems.map((item) => ({
        ID: item.id,
        "Program ID": item.program_id ?? "-",
        Program: item.program?.title ?? "-",
        "Category ID": item.program_learning_category_id,
        Category: item.program_learning_category?.title ?? "-",
        Title: item.title,
        Description: stripHtml(item.description) || "-",
        "No Urut": item.nomor,
        "Link PDF": item.file_pdf || "-",
        "Link YouTube": item.link_youtube || "-",
        "Link Video": item.file_video || "-",
        "Quiz Time (min)": item.quiz_time_limit_minutes ?? "-",
        "Min Score %": item.quiz_minimum_score_percent ?? "-",
        Status: item.status === 1 || item.status === true ? "Active" : "Inactive",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Learnings");
      const maxWidths = [
        { wch: 6 },
        { wch: 10 },
        { wch: 28 },
        { wch: 12 },
        { wch: 24 },
        { wch: 32 },
        { wch: 42 },
        { wch: 8 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 16 },
        { wch: 12 },
        { wch: 10 },
      ];
      worksheet["!cols"] = maxWidths;

      const fileName = `Program_Learnings_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data learning berhasil diekspor (${allItems.length} data).`,
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
      title: "Delete Learning?",
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
        text: "The learning has been removed.",
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
      <SiteHeader title="Program Learnings" />
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search title..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
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
                Add Learning
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4 w-14 text-center">ID</th>
                  <th className="px-4 py-4">Program</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Title</th>
                  <th className="px-4 py-4 max-w-[200px]">Description</th>
                  <th className="px-4 py-4 w-16 text-center">No</th>
                  <th className="px-4 py-4 w-24 text-center">Quiz (min)</th>
                  <th className="px-4 py-4 w-24 text-center">Min %</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={10}
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
                        {item.program?.title ?? (item.program_id ?? "-")}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {item.program_learning_category?.title ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-zinc-600">
                        {stripHtml(item.description) || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">{item.nomor}</td>
                      <td className="px-4 py-3 text-center text-zinc-600">
                        {item.quiz_time_limit_minutes != null ? item.quiz_time_limit_minutes : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-600">
                        {item.quiz_minimum_score_percent != null ? item.quiz_minimum_score_percent : "—"}
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
                      colSpan={10}
                    >
                      No learnings found.
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
          <LearningForm
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
