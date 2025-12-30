"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import Link from "next/link"; 
import Swal from "sweetalert2";
import {
  useGetProgramsQuery,
  useDeleteProgramsMutation,
} from "@/services/programs/programs.service"; // Adjusted service path
import type { Programs } from "@/types/programs/programs"; // Adjusted type path
import ProgramsForm from "@/components/form-modal/programs/programs-form"; // Adjusted form path

const PER_PAGE = 10;

interface UserRole {
  id: number;
  name: string;
}

export default function ProgramsPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");

  const { data: session } = useSession();
  
  const isOwner = useMemo(() => {
    const user = session?.user as { roles?: UserRole[] } | undefined;
    const roles = user?.roles || [];
    return roles.some((r) => r.name === "owner");
  }, [session]);

  const { data, isFetching, refetch } = useGetProgramsQuery({
    page,
    paginate,
    search: q,
    owner_id: isOwner ? session?.user?.id as number : undefined,
    program_category_id: undefined
  });

  const items: Programs[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // Dialog states
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deletePrograms, { isLoading: deleting }] = useDeleteProgramsMutation();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Delete Program?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deletePrograms(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The program has been removed.",
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
      <SiteHeader title="Program Management" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Search title, slug, or owner..."
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
            className="bg-sky-600 hover:bg-sky-700"
            onClick={() => setOpenForm({ mode: "create" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Program
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold text-zinc-700 border-b">
                <tr>
                  <th className="px-4 py-4">Title & Slug</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Owner</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-zinc-500" colSpan={5}>
                      Loading programs...
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{u.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{u.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {u.program_category_name || "Uncategorized"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {u.owner_name || "-"}
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
                            asChild
                            className="h-9 w-9 p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            title="Data Sales"
                          >
                            <Link href={`/cms/programs/sales?program-id=${u.id}`}>
                              <ShoppingCart className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="h-9 w-9 p-0 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                            title="Data Registration"
                          >
                            <Link href={`/cms/programs/register?program-id=${u.id}`}>
                              <ClipboardList className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenForm({ mode: "edit", id: u.id })}
                          className="h-9 w-9 p-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                          title="Edit"
                          >
                          <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u.id)}
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
                    <td className="px-4 py-12 text-center text-zinc-500" colSpan={5}>
                      No programs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t bg-zinc-50/30 px-4 py-3 text-xs font-medium text-zinc-500">
            <div>
              Showing {items.length} of {total} results • Page {page} of {lastPage}
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
          <ProgramsForm
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