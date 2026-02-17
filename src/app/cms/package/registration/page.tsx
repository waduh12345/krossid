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
  CreditCard,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  useGetPackageRegistrationsQuery,
  useDeletePackageRegistrationMutation,
} from "@/services/package/registration.service";
import { useGetPackagesQuery } from "@/services/package/package.service";
import {
  useGetPackagePaymentsQuery,
  useApprovePackagePaymentMutation,
} from "@/services/package/payment.service";
import type { PackageRegistration } from "@/types/package/registration";
import type { Package } from "@/types/package/package";
import type { PackagePayment, PackagePaymentStatus } from "@/types/package/payment";
import PackageRegistrationForm from "@/components/form-modal/package/package-registration-form";

const PER_PAGE = 10;

export default function PackageRegistrationPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [packageIdFilter, setPackageIdFilter] = useState<number | "">("");
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

  const { data, isFetching, refetch } = useGetPackageRegistrationsQuery({
    page,
    paginate,
    search: q,
    package_id: packageIdFilter === "" ? undefined : packageIdFilter,
  });

  const items: PackageRegistration[] = useMemo(
    () => (data?.data ?? []) as PackageRegistration[],
    [data]
  );
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);
  const [paymentModalRegistrationId, setPaymentModalRegistrationId] = useState<number | null>(null);

  const [deleteRegistration, { isLoading: deleting }] =
    useDeletePackageRegistrationMutation();
  const [approvePayment, { isLoading: approving }] = useApprovePackagePaymentMutation();

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate, packageIdFilter]);

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
      const excelData = exportData.data.map((reg: PackageRegistration) => ({
        ID: reg.id,
        Package: reg.package?.name ?? reg.package_id,
        User: reg.user?.name ?? reg.user?.email ?? "-",
        Email: reg.user?.email ?? "-",
        Phone: reg.user?.phone ?? "-",
        Office: reg.user?.office ?? "-",
        "Active From": formatDate(reg.active_from),
        "Active Until": formatDate(reg.active_until),
        Status: reg.status === 1 || reg.status === true ? "Active" : "Inactive",
        "Used Users": reg.used_users,
        "Used Campaigns": reg.used_campaigns,
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      const fileName = `Package_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data registrasi berhasil diekspor (${exportData.data.length} data).`,
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

  const { data: paymentsData } = useGetPackagePaymentsQuery(
    {
      page: 1,
      paginate: 50,
      package_registration_id: paymentModalRegistrationId,
    },
    { skip: !paymentModalRegistrationId }
  );
  const paymentList: PackagePayment[] = useMemo(
    () => (paymentsData?.data ?? []) as PackagePayment[],
    [paymentsData]
  );

  function formatDate(s: string | null | undefined) {
    if (!s) return "-";
    try {
      return new Date(s).toLocaleDateString();
    } catch {
      return s;
    }
  }

  function paymentStatusBadge(status: PackagePaymentStatus) {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green px-2 py-0.5 text-xs font-medium text-green-700">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Pending
          </span>
        );
    }
  }

  async function handleApprovePayment(paymentId: number, status: "approved" | "rejected") {
    const result = await Swal.fire({
      title: status === "approved" ? "Approve Payment?" : "Reject Payment?",
      input: "textarea",
      inputLabel: "Notes (optional)",
      inputPlaceholder: "Add notes...",
      showCancelButton: true,
      confirmButtonText: status === "approved" ? "Approve" : "Reject",
      confirmButtonColor: status === "approved" ? "#22c55e" : "#ef4444",
    });
    if (result.isDismissed) return;
    const notes = (result.value as string)?.trim() || null;
    try {
      await approvePayment({ id: paymentId, payload: { status, notes } }).unwrap();
      await Swal.fire({
        icon: "success",
        title: status === "approved" ? "Approved!" : "Rejected!",
      });
      // Daftar payment otomatis refresh via invalidatesTags di payment.service
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Registration?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;
    try {
      await deleteRegistration(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The registration has been removed.",
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
      <SiteHeader title="Package Registration" />
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
              <PackageIcon className="h-4 w-4 text-zinc-500" />
              <select
                className="h-9 rounded-xl border bg-background px-2 text-sm min-w-[140px]"
                value={packageIdFilter}
                onChange={(e) =>
                  setPackageIdFilter(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
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
              Add Registration
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Package</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Office</th>
                  <th className="px-4 py-4">Active From</th>
                  <th className="px-4 py-4">Active Until</th>
                  <th className="px-4 py-4">Status</th>
                  {/* <th className="px-4 py-4">Used Users</th> */}
                  {/* <th className="px-4 py-4">Used Campaigns</th> */}
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={11}
                    >
                      Loading registrations...
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.package?.name ?? `#${row.package_id}`}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.user?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {row.user?.email ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {row.user?.phone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {row.user?.office ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {formatDate(row.active_from)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {formatDate(row.active_until)}
                      </td>
                      <td className="px-4 py-3">
                        {row.status === 1 || row.status === true ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inactive
                          </span>
                        )}
                      </td>
                      {/* <td className="px-4 py-3 text-zinc-600">
                        {row.used_users}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.used_campaigns}
                      </td> */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap py-0.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPaymentModalRegistrationId(row.id)}
                            className="h-9 w-9 p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            title="Payment"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
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
                      colSpan={11}
                    >
                      No registrations found.
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
          <PackageRegistrationForm
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

        {/* Modal Informasi Pembayaran + Approval */}
        {paymentModalRegistrationId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border bg-white shadow-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Informasi Pembayaran (Registration #{paymentModalRegistrationId})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPaymentModalRegistrationId(null)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {paymentList.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-8">
                    Belum ada data pembayaran untuk registrasi ini.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {paymentList.map((pay) => (
                      <div
                        key={pay.id}
                        className="rounded-xl border border-zinc-200 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-gray-900">
                            ID #{pay.id} • ${pay.amount.toLocaleString()}
                          </span>
                          {paymentStatusBadge(pay.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600">
                          <span>Method:</span>
                          <span>{pay.payment_method ?? "-"}</span>
                          <span>Paid at:</span>
                          <span>{pay.paid_at ? new Date(pay.paid_at).toLocaleString() : "-"}</span>
                          <span>Proof:</span>
                          <span>
                            {pay.proof_file ? (
                              <a
                                href={pay.proof_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:underline"
                              >
                                Lihat
                              </a>
                            ) : (
                              "-"
                            )}
                          </span>
                          {pay.approved_at && (
                            <>
                              <span>Approved at:</span>
                              <span>{new Date(pay.approved_at).toLocaleString()}</span>
                              {pay.approvedByUser && (
                                <>
                                  <span>By:</span>
                                  <span>{pay.approvedByUser.name ?? pay.approvedByUser.email ?? "-"}</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        {pay.notes && (
                          <p className="text-xs text-zinc-500">Notes: {pay.notes}</p>
                        )}
                        {pay.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprovePayment(pay.id, "approved")}
                              disabled={approving}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprovePayment(pay.id, "rejected")}
                              disabled={approving}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
