"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combo-box";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

import {
  Search,
  Trash2,
  RefreshCw,
  Building2,
  User,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  useGetSalesListQuery,
  useDeleteSalesMutation,
  useExportSalesMutation,
  useImportSalesMutation,
} from "@/services/programs/sales.service";
import { useGetProgramsQuery, useCreateProgramsMutation } from "@/services/programs/programs.service";
import type { Sales } from "@/types/programs/sales";

const PER_PAGE = 10;

interface UserRole {
  id: number;
  name: string;
}

export default function ProgramSalesPage() {
  const searchParams = useSearchParams();
  const programIdFromUrl = searchParams.get("program-id");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  const { data: session } = useSession();

  const isOwner = useMemo(() => {
    const user = session?.user as { roles?: UserRole[] } | undefined;
    const roles = user?.roles || [];
    return roles.some((r) => r.name === "owner");
  }, [session]);

  useEffect(() => {
    if (programIdFromUrl) {
      const id = parseInt(programIdFromUrl);
      if (!isNaN(id)) setSelectedProgramId(id);
    }
  }, [programIdFromUrl]);

  // Mutations
  const [deleteSale, { isLoading: deleting }] = useDeleteSalesMutation();
  const [exportSales, { isLoading: exporting }] = useExportSalesMutation();
  const [importSales, { isLoading: importing }] = useImportSalesMutation();

  // 1. Fetch Programs
  const { data: progResp, isLoading: loadingProgs } = useGetProgramsQuery({
    page: 1,
    paginate: 100,
    search: "",
    owner_id: isOwner ? (session?.user?.id as number) : undefined,
  });
  const programOptions = useMemo(() => progResp?.data ?? [], [progResp]);

  // 2. Fetch Sales
  const { data, isFetching, refetch } = useGetSalesListQuery({
    page,
    paginate,
    search: q,
    program_id: selectedProgramId ?? undefined,
    owner_id: isOwner ? (session?.user?.id as number) : undefined,
  });

  const items: Sales[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [q, paginate, selectedProgramId]);

  // --- Handlers ---

  // ProgramSalesPage.tsx

const handleExport = async () => {
    if (items.length === 0) return;

    // 1. Map data agar rapi di Excel
    const excelData = items.map((item) => ({
      "Program Name": item.program_name,
      "Sub Title": item.program_sub_title,
      "Email": item.email,
      "Type": item.is_corporate ? "Corporate" : "Individual",
      "Status": item.status === 1 ? "Active" : "Inactive",
    }));

    // 2. Buat Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    // 3. Download
    XLSX.writeFile(workbook, `Current_View_Sales.xlsx`);
    
    Swal.fire({ icon: "success", title: "Exported", text: "Current view saved to Excel." });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await importSales(formData).unwrap();
      await Swal.fire({ icon: "success", title: "Imported", text: res.message });
      void refetch();
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: e?.data?.message || "Check your file format.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Record?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteSale(id).unwrap();
      await Swal.fire({ icon: "success", title: "Deleted" });
      void refetch();
    } catch (e: any) {
      await Swal.fire({ icon: "error", title: "Error", text: e?.data?.message || "Delete failed" });
    }
  }

  return (
    <>
      <SiteHeader title="Programs - Sales Overview" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-wrap items-center gap-2">
            <div className="w-full md:w-64">
              <Combobox
                placeholder="Filter by Program"
                data={programOptions}
                value={selectedProgramId}
                onChange={(val) => setSelectedProgramId(val)}
                isLoading={loadingProgs}
                getOptionLabel={(opt: any) => opt.title}
              />
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setQ("");
                setSelectedProgramId(null);
                setPage(1);
                void refetch();
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Export / Import Buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".xlsx, .xls, .csv"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="border-sky-600 text-sky-600 hover:bg-sky-50"
            >
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Import
            </Button>
            <Button
              variant="default"
              onClick={handleExport}
              disabled={exporting}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Program</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr><td className="px-4 py-10 text-center" colSpan={5}>Loading...</td></tr>
                ) : items.length ? (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <div className="font-bold">{item.program_name}</div>
                        <div className="text-[10px] text-zinc-400 italic">{item.program_sub_title}</div>
                      </td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">
                        {item.is_corporate ? (
                          <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase">
                            <Building2 className="h-3 w-3" /> Corp
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-bold uppercase">
                            <User className="h-3 w-3" /> Indiv
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ring-1 ${item.status === true ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                          {item.status === true ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="px-4 py-12 text-center text-zinc-500" colSpan={5}>No sales data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs text-zinc-500">
            <div>Page {page} of {lastPage} • Total {total} entries</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}