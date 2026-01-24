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
  Trophy,
  Crown,
  User,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetTopSalesQuery,
  useDeleteTopSaleMutation,
} from "@/services/programs/top-sales.service";
import type { TopSale } from "@/types/programs/top-sales";
import TopSalesForm from "@/components/form-modal/programs/top-sales-form";

const PER_PAGE = 10;

export default function TopSalesPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");

  const { data, isFetching, refetch } = useGetTopSalesQuery({
    page,
    paginate,
  });

  const items: TopSale[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // Dialog states
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteTopSale, { isLoading: deleting }] = useDeleteTopSaleMutation();

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!q) return items;
    const searchLower = q.toLowerCase();
    return items.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.user?.phone?.toLowerCase().includes(searchLower)
    );
  }, [items, q]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Top Sale?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteTopSale(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The top sale has been removed.",
        confirmButtonColor: "#10b981",
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: e instanceof Error ? e.message : "Something went wrong.",
        confirmButtonColor: "#ef4444",
      });
    }
  }

  return (
    <>
      <SiteHeader title="Top Sales Management" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search user name, email, or phone..."
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

          <Button
            variant="default"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            onClick={() => setOpenForm({ mode: "create" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Top Sale
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-yellow-50 to-orange-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-zinc-500" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading top sales...
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="font-black text-lg text-yellow-600">
                            #{item.order}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="font-bold text-gray-900">
                            {item.user?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {item.user?.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {item.user?.phone || "-"}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpenForm({ mode: "edit", id: item.id })}
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
                    <td className="px-4 py-12 text-center text-zinc-500" colSpan={6}>
                      <div className="flex flex-col items-center gap-2">
                        <Trophy className="h-12 w-12 text-zinc-300" />
                        <p className="font-semibold">No top sales found.</p>
                        {q && (
                          <p className="text-xs text-zinc-400">
                            Try adjusting your search query
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs font-medium text-zinc-500">
            <div>
              Showing {filteredItems.length} of {total} results • Page {page} of {lastPage}
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

        {/* Modal Form */}
        {openForm && (
          <TopSalesForm
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
