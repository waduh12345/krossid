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
  BookOpen,
  User,
  Calendar,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import {
  useGetProgramLearningSalesQuery,
  useDeleteProgramLearningSaleMutation,
} from "@/services/programs/learning-sales.service";
import type { ProgramLearningSale } from "@/types/programs/learning-sales";
import LearningSalesForm from "@/components/form-modal/programs/learning-sales-form";
import { ApiError } from "@/lib/utils";

type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

const PER_PAGE = 10;

function formatDateTime(str: string | null): string {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProgramLearningSalesPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;
  const isSuperadmin = userRole === "superadmin";

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data, isFetching, refetch } = useGetProgramLearningSalesQuery({
    page,
    paginate,
    search: q,
  });

  const items: ProgramLearningSale[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteItem, { isLoading: deleting }] =
    useDeleteProgramLearningSaleMutation();

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
      const allItems: ProgramLearningSale[] = [...exportData.data];
      const excelData = allItems.map((item) => ({
        ID: item.id,
        "Learning ID": item.program_learning_id,
        Learning: item.program_learning?.title ?? "-",
        "Sales ID": item.sales_id,
        "Sales Name": item.sales?.name ?? "-",
        "Sales Email": item.sales?.email ?? "-",
        "Started At": item.started_at ? formatDateTime(item.started_at) : "-",
        "Completed At": item.completed_at
          ? formatDateTime(item.completed_at)
          : "-",
        Status: item.status === 1 || item.status === true ? "Active" : "Inactive",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Learning Sales");
      const maxWidths = [
        { wch: 6 },
        { wch: 12 },
        { wch: 32 },
        { wch: 10 },
        { wch: 22 },
        { wch: 26 },
        { wch: 18 },
        { wch: 18 },
        { wch: 10 },
      ];
      worksheet["!cols"] = maxWidths;

      const fileName = `Learning_Sales_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data assignment berhasil diekspor (${allItems.length} data).`,
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
      title: "Hapus assignment?",
      text: "Sales akan dilepas dari learning ini. Tindakan ini tidak dapat dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteItem(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Assignment telah dihapus.",
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
      <SiteHeader title="Learning Sales — Assign Sales ke Learning" />
      <div className="space-y-6 px-4 py-6">
        {/* Intro */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5 dark:border-sky-900/30 dark:from-sky-950/30 dark:to-background">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
                <ClipboardList className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Assignment Sales ke Learning
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kelola penugasan sales ke materi learning. Cari, filter, dan export data.
                </p>
              </div>
            </div>
            {total > 0 && (
              <div className="rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:bg-gray-800/80 dark:text-gray-300">
                Total: <span className="font-bold text-sky-600">{total}</span> assignment
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="relative w-full min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari learning atau sales..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl border-gray-200 pl-9 focus-visible:ring-sky-500"
              />
            </div>
            <select
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-sky-500"
              value={paginate}
              onChange={(e) => setPaginate(Number(e.target.value))}
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => {
                setQ("");
                setPage(1);
                void refetch();
              }}
              title="Reset filter"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting || total === 0}
              className="rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Excel
            </Button>
            {isSuperadmin && (
              <Button
                className="rounded-xl bg-sky-600 hover:bg-sky-700"
                onClick={() => setOpenForm({ mode: "create" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Sales
              </Button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-4 w-14 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    No
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Learning
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Sales
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Mulai
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Selesai
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  {isSuperadmin && (
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-16 text-center text-gray-500"
                      colSpan={isSuperadmin ? 7 : 6}
                    >
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-500" />
                      <p className="mt-2">Memuat data...</p>
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-4 py-3 text-center font-mono text-gray-500">
                        {(page - 1) * paginate + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
                            <BookOpen className="h-4 w-4 text-sky-600" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.program_learning?.title ?? `Learning #${item.program_learning_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.sales?.name ?? `Sales #${item.sales_id}`}
                            </p>
                            {item.sales?.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.sales.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 shrink-0" />
                          {formatDateTime(item.started_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          {formatDateTime(item.completed_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === 1 || item.status === true ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      {isSuperadmin && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 rounded-lg border-sky-200 p-0 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-800 dark:text-sky-400"
                              onClick={() =>
                                setOpenForm({ mode: "edit", id: item.id })
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 rounded-lg border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-16 text-center text-gray-500"
                      colSpan={isSuperadmin ? 7 : 6}
                    >
                      <ClipboardList className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <p className="mt-3 font-medium">Belum ada assignment</p>
                      <p className="mt-1 text-sm">
                        {q
                          ? "Coba ubah kata kunci pencarian."
                          : "Klik \"Assign Sales\" untuk menambah penugasan sales ke learning."}
                      </p>
                      {isSuperadmin && !q && (
                        <Button
                          className="mt-4"
                          onClick={() => setOpenForm({ mode: "create" })}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Assign Sales
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/30">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Menampilkan {(page - 1) * paginate + 1}–{Math.min(page * paginate, total)} dari {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span className="px-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {page} / {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>

        {isSuperadmin && openForm && (
          <LearningSalesForm
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
