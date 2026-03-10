"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetContactsListQuery,
  useDeleteContactMutation,
} from "@/services/contact.service";
import type { Contact } from "@/types/contact";
import ContactForm from "@/components/form-modal/contact-form";
import ContactDetailModal from "@/components/modal/contact-detail-modal";

type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;

  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [q, setQ] = useState("");
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // dialogs
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  // auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (
      status === "authenticated" &&
      userRole !== "superadmin" &&
      userRole !== "owner" &&
      userRole !== "director"
    ) {
      router.replace("/cms/dashboard");
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Akses Ditolak",
          text: "Anda tidak memiliki akses ke halaman Contact.",
          confirmButtonColor: "#3b82f6",
          timer: 3000,
          timerProgressBar: true,
        });
      }, 300);
    }
  }, [status, userRole, router]);

  const { data, isFetching, refetch } = useGetContactsListQuery({
    page,
    paginate,
    s: q,
    orderBy,
    order,
  });

  const items: Contact[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();

  // debounce search → reset to page 1
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  function handleSort(col: string) {
    if (orderBy === col) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(col);
      setOrder("desc");
    }
    setPage(1);
  }

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus contact?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0ea5e9",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteContact(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Contact dihapus.",
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  // loading session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (
    status !== "authenticated" ||
    (userRole !== "superadmin" &&
      userRole !== "owner" &&
      userRole !== "director")
  ) {
    return null;
  }

  const canCRUD = userRole === "superadmin" || userRole === "owner";

  return (
    <>
      <SiteHeader title="Contact Management" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Cari nama, email, subject..."
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
              onClick={() => {
                setQ("");
                setPage(1);
                setOrderBy("id");
                setOrder("desc");
                void refetch();
              }}
            >
              Reset
            </Button>
          </div>

          {canCRUD && (
            <Button
              variant="default"
              onClick={() => setOpenForm({ mode: "create" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Contact
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold">
                <tr>
                  <th className="px-4 py-3 w-12">#</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Nama
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("email")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Email
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    </span>
                  </th>
                  <th className="px-4 py-3 hidden lg:table-cell">Telepon</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("subject")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Subject
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 hidden md:table-cell cursor-pointer select-none"
                    onClick={() => handleSort("created_at")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Tanggal
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={7}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 text-zinc-400 align-middle">
                        {(page - 1) * paginate + idx + 1}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="font-semibold text-gray-800 text-xs md:text-sm">
                          {c.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs md:text-sm text-gray-600">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 align-middle text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                        {c.phone || "-"}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="text-xs md:text-sm text-gray-700 max-w-[200px] truncate">
                          {c.subject}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailId(c.id)}
                            title="Lihat Detail"
                            className="bg-white hover:bg-[#4A90E2] text-[#4A90E2] hover:text-white border border-[#4A90E2] rounded-xl h-9 w-9 p-0 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCRUD && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setOpenForm({ mode: "edit", id: c.id })
                                }
                                title="Edit"
                                className="bg-white hover:bg-[#4A90E2] text-[#4A90E2] hover:text-white border border-[#4A90E2] rounded-xl h-9 w-9 p-0 transition-all"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(c.id)}
                                disabled={deleting}
                                title="Hapus"
                                className="bg-white hover:bg-red-500 text-red-500 hover:text-white border border-red-500 rounded-xl h-9 w-9 p-0 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-zinc-500"
                      colSpan={7}
                    >
                      Tidak ada data contact.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-600">
            <div>
              Total {total} data &bull; Halaman {page} dari {lastPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="rounded-lg"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {openForm && (
          <ContactForm
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

        {/* Detail Modal */}
        {detailId != null && (
          <ContactDetailModal
            open
            id={detailId}
            onClose={() => setDetailId(null)}
          />
        )}
      </div>
    </>
  );
}
