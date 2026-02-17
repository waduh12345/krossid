"use client";

import { useEffect, useState } from "react";
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
  ListChecks,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  useGetPackagesQuery,
  useDeletePackageMutation,
} from "@/services/package/package.service";
import {
  useGetPackageFeaturesQuery,
  useDeletePackageFeatureMutation,
} from "@/services/package/feature.service";
import type { Package } from "@/types/package/package";
import type { PackageFeature } from "@/types/package/feature";
import PackageForm from "@/components/form-modal/package/package-form";
import PackageFeatureForm from "@/components/form-modal/package/package-feature-form";

const PER_PAGE = 10;
const STORAGE_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/api\/v\d+$/,
  ""
);

function imgUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/")
    ? `${STORAGE_BASE}${path}`
    : `${STORAGE_BASE}/${path}`;
}

export default function PackagePage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Package list view vs Feature list view for a selected package
  const [selectedPackage, setSelectedPackage] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Feature list state (when selectedPackage is set)
  const [featurePage, setFeaturePage] = useState<number>(1);
  const [featurePaginate, setFeaturePaginate] = useState<number>(10);
  const [featureQ, setFeatureQ] = useState<string>("");

  const { data, isFetching, refetch } = useGetPackagesQuery({
    page,
    paginate,
    search: q,
  });

  const items: Package[] = (data?.data ?? []) as Package[];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const {
    data: featureData,
    isFetching: featureFetching,
    refetch: refetchFeatures,
  } = useGetPackageFeaturesQuery(
    {
      page: featurePage,
      paginate: featurePaginate,
      package_id: selectedPackage?.id ?? 0,
      search: featureQ,
    },
    { skip: !selectedPackage }
  );

  const featureItems: PackageFeature[] = (featureData?.data ?? []) as PackageFeature[];
  const featureLastPage = featureData?.last_page ?? 1;
  const featureTotal = featureData?.total ?? 0;

  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [openFeatureForm, setOpenFeatureForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deletePackage, { isLoading: deleting }] = useDeletePackageMutation();
  const [deleteFeature, { isLoading: deletingFeature }] =
    useDeletePackageFeatureMutation();

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  useEffect(() => {
    if (selectedPackage) {
      const t = setTimeout(() => setFeaturePage(1), 250);
      return () => clearTimeout(t);
    }
  }, [featureQ, featurePaginate, selectedPackage]);

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
      const excelData = exportData.data.map((pkg: Package) => ({
        ID: pkg.id,
        Name: pkg.name,
        Image: pkg.image ?? "-",
        Description: pkg.description ?? "-",
        Number: pkg.number,
        "Price (Month)": pkg.price_month,
        "Price (Year)": pkg.price_year,
        "Discount (Month)": pkg.price_discount_month ?? "-",
        "Discount (Year)": pkg.price_discount_year ?? "-",
        Status: pkg.status === 1 || pkg.status === true ? "Active" : "Inactive",
        "Max Users": pkg.max_users ?? "-",
        "Max Campaigns": pkg.max_campaigns ?? "-",
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Packages");
      const fileName = `Packages_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data package berhasil diekspor (${exportData.data.length} data).`,
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

  async function handleDeletePackage(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Package?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;
    try {
      await deletePackage(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The package has been removed.",
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

  async function handleDeleteFeature(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Feature?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;
    try {
      await deleteFeature(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The feature has been removed.",
      });
      void refetchFeatures();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  // Feature list view (when a package is selected)
  if (selectedPackage) {
    return (
      <>
        <SiteHeader title="Package & Feature Management" />
        <div className="space-y-6 px-4 py-6">
          <div className="flex items-center gap-4 border-b pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPackage(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Packages
            </Button>
            <h2 className="text-lg font-semibold text-zinc-700">
              Features: {selectedPackage.name}
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
                <Input
                  placeholder="Search feature..."
                  value={featureQ}
                  onChange={(e) => setFeatureQ(e.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
              <select
                className="h-9 rounded-xl border bg-background px-2 text-sm"
                value={featurePaginate}
                onChange={(e) => setFeaturePaginate(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setFeatureQ("");
                  setFeaturePage(1);
                  void refetchFeatures();
                }}
                title="Reset Filter"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="default"
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => setOpenFeatureForm({ mode: "create" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                  <tr>
                    <th className="px-4 py-4">Label</th>
                    <th className="px-4 py-4">Value</th>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {featureFetching && !featureItems.length ? (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-zinc-500"
                        colSpan={4}
                      >
                        Loading features...
                      </td>
                    </tr>
                  ) : featureItems.length ? (
                    featureItems.map((f) => (
                      <tr
                        key={f.id}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {f.label}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {f.value ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{f.nomor}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setOpenFeatureForm({ mode: "edit", id: f.id })
                              }
                              className="h-9 w-9 p-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFeature(f.id)}
                              disabled={deletingFeature}
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
                        colSpan={4}
                      >
                        No features found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs font-medium text-zinc-500">
              <div>
                Showing {featureItems.length} of {featureTotal} results • Page{" "}
                {featurePage} of {featureLastPage}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setFeaturePage((p) => Math.max(1, p - 1))
                  }
                  disabled={featurePage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setFeaturePage((p) =>
                      Math.min(featureLastPage, p + 1)
                    )
                  }
                  disabled={featurePage === featureLastPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {openFeatureForm && (
            <PackageFeatureForm
              open
              mode={openFeatureForm.mode}
              packageId={selectedPackage.id}
              id={openFeatureForm.id}
              onClose={() => setOpenFeatureForm(null)}
              onSuccess={() => {
                setOpenFeatureForm(null);
                void refetchFeatures();
              }}
            />
          )}
        </div>
      </>
    );
  }

  // Package list view (default)
  return (
    <>
      <SiteHeader title="Package Management" />
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search package name..."
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
            <Button
              variant="default"
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => setOpenForm({ mode: "create" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Package
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Image</th>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Price (Month / Year)</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={5}
                    >
                      Loading packages...
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border bg-zinc-100">
                          {imgUrl(u.image_avif_url) ? (
                            <img
                              src={imgUrl(u.image_avif_url)!}
                              alt={u.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        {u.description && (
                          <div className="text-xs text-zinc-400 line-clamp-1">
                            {u.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {u.price_month} / {u.price_year}
                      </td>
                      <td className="px-4 py-3">
                        {u.status === 1 || u.status === true ? (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedPackage({ id: u.id, name: u.name })
                            }
                            className="h-9 w-9 p-0 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            title="Features"
                          >
                            <ListChecks className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setOpenForm({ mode: "edit", id: u.id })
                            }
                            className="h-9 w-9 p-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePackage(u.id)}
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
                      colSpan={5}
                    >
                      No packages found.
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
          <PackageForm
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
