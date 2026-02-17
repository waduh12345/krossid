"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Loader2,
  Package as PackageIcon,
  User,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  useGetPackageRegistrationLogsQuery,
  useDeletePackageRegistrationLogMutation,
} from "@/services/package/registration-log.service";
import { useGetPackagesQuery } from "@/services/package/package.service";
import { useGetPackageRegistrationsQuery } from "@/services/package/registration.service";
import type { PackageRegistrationLog } from "@/types/package/registration-log";
import type { Package } from "@/types/package/package";
import type { PackageRegistration } from "@/types/package/registration";
import PackageRegistrationLogForm from "@/components/form-modal/package/package-registration-log-form";

const PER_PAGE = 10;

export default function PackageRegistrationLogPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [packageIdFilter, setPackageIdFilter] = useState<number | "">("");
  const [registrationIdFilter, setRegistrationIdFilter] = useState<number | "">("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data: packagesResp } = useGetPackagesQuery({
    page: 1,
    paginate: 100,
    search: "",
  });
  const packages: Package[] = useMemo(
    () => (packagesResp?.data ?? []) as Package[],
    [packagesResp]
  );

  const { data: regsResp } = useGetPackageRegistrationsQuery({
    page: 1,
    paginate: 200,
    search: "",
    package_id: packageIdFilter === "" ? undefined : packageIdFilter,
  });
  const registrations: PackageRegistration[] = useMemo(
    () => (regsResp?.data ?? []) as PackageRegistration[],
    [regsResp]
  );

  const { data, isFetching, refetch } = useGetPackageRegistrationLogsQuery({
    page,
    paginate,
    search: q,
    package_registration_id:
      registrationIdFilter === "" ? undefined : registrationIdFilter,
  });

  const items: PackageRegistrationLog[] = useMemo(
    () => (data?.data ?? []) as PackageRegistrationLog[],
    [data]
  );
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteLog, { isLoading: deleting }] =
    useDeletePackageRegistrationLogMutation();

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate, registrationIdFilter]);

  useEffect(() => {
    if (packageIdFilter === "") {
      setRegistrationIdFilter("");
    }
  }, [packageIdFilter]);

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
      const excelData = exportData.data.map((log: PackageRegistrationLog) => ({
        ID: log.id,
        "Registration ID": log.package_registration_id,
        Package: log.package_registration?.package?.name ?? "-",
        User: log.package_registration?.user
          ? (log.package_registration.user.name ??
            log.package_registration.user.email ??
            `#${log.package_registration.user_id}`)
          : "-",
        Action: log.action ?? "-",
        "Limit Users": log.limit_users,
        "Limit Campaigns": log.limit_campaigns,
        "Used Users": log.used_users,
        "Used Campaigns": log.used_campaigns,
        Notes: log.notes ?? "-",
        "Created At": log.created_at ?? "-",
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registration Logs");
      const fileName = `Package_Registration_Logs_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data log berhasil diekspor (${exportData.data.length} data).`,
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
      title: "Delete Log?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;
    try {
      await deleteLog(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The log has been removed.",
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  return (
    <>
      <SiteHeader title="Package Registration Log" />
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              <PackageIcon className="h-4 w-4 shrink-0 text-zinc-500" />
              <select
                className="h-9 rounded-xl border bg-background px-2 text-sm min-w-[140px]"
                value={packageIdFilter}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Number(e.target.value);
                  setPackageIdFilter(v);
                  if (v === "") setRegistrationIdFilter("");
                }}
                title="Filter by package"
              >
                <option value="">All packages</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 shrink-0 text-zinc-500" />
              <select
                className="h-9 rounded-xl border bg-background px-2 text-sm min-w-[180px]"
                value={registrationIdFilter}
                onChange={(e) =>
                  setRegistrationIdFilter(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                title="Filter by registration (package – user)"
              >
                <option value="">All registrations</option>
                {registrations.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.package?.name ?? `#${reg.package_id}`} –{" "}
                    {reg.user
                      ? reg.user.name ?? reg.user.email ?? `#${reg.user_id}`
                      : "-"}
                  </option>
                ))}
              </select>
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
                setPackageIdFilter("");
                setRegistrationIdFilter("");
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
            <Button
              variant="default"
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => setOpenForm({ mode: "create" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Log
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Package / User</th>
                  <th className="px-4 py-4">Action</th>
                  <th className="px-4 py-4">Used Users</th>
                  <th className="px-4 py-4">Used Campaigns</th>
                  <th className="px-4 py-4">Notes</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={6}
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.package_registration?.package?.name ??
                            `Reg #${row.package_registration_id}`}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {row.package_registration?.user
                            ? row.package_registration.user.name ??
                              row.package_registration.user.email ??
                              `#${row.package_registration.user_id}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.action ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.used_users} / {row.limit_users}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.used_campaigns} / {row.limit_campaigns}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 max-w-[200px] truncate">
                        {row.notes ?? "-"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setOpenForm({ mode: "edit", id: row.id })
                            }
                            className="h-9 w-9 p-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(row.id)}
                            disabled={deleting}
                            title="Delete"
                            className="bg-white hover:bg-red-500 text-red-500 hover:text-white border border-red-500 h-9 w-9 p-0 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-zinc-500"
                      colSpan={6}
                    >
                      No logs found.
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

        {openForm && (
          <PackageRegistrationLogForm
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
