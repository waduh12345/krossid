"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combo-box";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trash2, RefreshCw, Eye, Info } from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetRegisterListQuery,
  useDeleteRegisterMutation,
} from "@/services/programs/register.service";
import {
  useGetProgramsQuery,
  useGetProgramsByIdQuery,
} from "@/services/programs/programs.service";
import type { Register } from "@/types/programs/register";
import { ApiError } from "@/lib/utils";

const PER_PAGE = 10;
interface UserRole {
  id: number;
  name: string;
}

// Pisahkan konten utama agar bisa dibungkus Suspense
function RegisterTableContent() {
  const searchParams = useSearchParams();
  const programIdFromUrl = searchParams.get("program-id");

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null
  );

  const [selectedRecord, setSelectedRecord] = useState<Register | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: session } = useSession();

  const isOwner = useMemo(() => {
    const user = session?.user as { roles?: UserRole[] } | undefined;
    const roles = user?.roles || [];
    return roles.some((r) => r.name === "owner");
  }, [session]);

  // 1. Sinkronisasi Program ID dari URL ke State
  useEffect(() => {
    if (programIdFromUrl) {
      const id = parseInt(programIdFromUrl);
      if (!isNaN(id)) {
        setSelectedProgramId(id);
      }
    }
  }, [programIdFromUrl]);

  // 2. Data Fetching
  const { data: progResp, isLoading: loadingProgs } = useGetProgramsQuery({
    page: 1,
    paginate: 100,
    search: "",
    owner_id: isOwner ? (session?.user?.id as number) : undefined,
    program_category_id: undefined,
  });
  const programOptions = useMemo(() => progResp?.data ?? [], [progResp]);

  const { data, isFetching, refetch } = useGetRegisterListQuery({
    page,
    paginate,
    search: q,
    program_id: selectedProgramId ?? undefined,
    owner_id: isOwner ? (session?.user?.id as number) : undefined,
  });

  const { data: programDetail, isLoading: loadingDetail } =
    useGetProgramsByIdQuery(selectedRecord?.program_id ?? 0, {
      skip: !selectedRecord,
    });

  const items: Register[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [deleteSale, { isLoading: deleting }] = useDeleteRegisterMutation();

  useEffect(() => {
    setPage(1);
  }, [q, paginate, selectedProgramId]);

  const handleOpenDetail = (item: Register) => {
    setSelectedRecord(item);
    setIsModalOpen(true);
  };

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Register Record?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteSale(id).unwrap();
      await Swal.fire({ icon: "success", title: "Deleted" });
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

  const tableData = useMemo(() => {
    // Perbaikan akses data
    const parameterString = programDetail?.parameter;

    if (!parameterString || !selectedRecord?.parameter_value) return [];

    const headers = parameterString.split("|");
    const values = String(selectedRecord.parameter_value).split("|");

    return headers.map((header: string, index: number) => ({
      label: header,
      value: values[index] || "-",
    }));
  }, [programDetail, selectedRecord]);

  return (
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
              // PERBAIKAN DI SINI: Mengganti any dengan tipe objek spesifik
              getOptionLabel={(opt: { title: string }) => opt.title}
            />
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
            <Input
              placeholder="Search email or name..."
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
          </select>

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
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Main */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
              <tr>
                <th className="px-4 py-4">Program</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Phone</th>
                <th className="px-4 py-4 text-center">Detail Information</th>
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
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">
                        {item.program_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">{item.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2 border-zinc-300"
                        onClick={() => handleOpenDetail(item)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Lihat Data
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          item.status === 1
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-red-50 text-red-700 ring-red-600/20"
                        }`}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-zinc-500"
                    colSpan={7}
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs text-zinc-500">
          <div>
            Total {total} entries • Page {page} of {lastPage}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL DATA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Detail Pendaftaran
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-zinc-500 w-24">
                  Name
                </span>
                <span className="text-sm text-zinc-900">
                  {selectedRecord?.name}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-medium text-zinc-500 w-24">
                  Email
                </span>
                <span className="text-sm text-zinc-900">
                  {selectedRecord?.email}
                </span>
              </div>
              <div className="flex gap-2 cols-span-2">
                <span className="text-sm font-semibold text-zinc-900">
                  {selectedRecord?.program_name}
                </span>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="min-w-full text-sm divide-y">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-zinc-700">
                      Parameter
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-zinc-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {loadingDetail ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-zinc-500 italic"
                      >
                        Memuat detail parameter...
                      </td>
                    </tr>
                  ) : tableData.length > 0 ? (
                    tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-2.5 font-semibold text-zinc-600 bg-zinc-50/30 w-1/3">
                          {row.label}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-900">
                          {row.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-zinc-500"
                      >
                        Tidak ada data tambahan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export default dengan Suspense
export default function ProgramRegisterPage() {
  return (
    <>
      <SiteHeader title="Programs - Register Overview" />
      <Suspense
        fallback={<div className="p-8 text-center">Loading filters...</div>}
      >
        <RegisterTableContent />
      </Suspense>
    </>
  );
}