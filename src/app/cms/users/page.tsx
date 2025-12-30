"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MailCheck,
  Pencil,
  Trash2,
  KeyRound,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetUsersListQuery,
  useDeleteUserMutation,
  useValidateUserEmailMutation,
  useValidateUserPhoneMutation,
} from "@/services/users-management.service";
import type { Users } from "@/types/user";
import UsersForm from "@/components/form-modal/users-form";
import PasswordDialog from "@/components/modal/users-password-dialog";
import { IconPhoneCheck } from "@tabler/icons-react";

const PER_PAGE = 10;
// kalau mau, kamu bisa hilangkan ini dan jangan kirim ke query
const DEFAULT_LIST_ROLE_ID = 2;

function formatDate(s?: string | null) {
  if (!s) return "-";
  return new Date(s).toLocaleString("id-ID");
}

export default function UsersPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");

  const { data, isFetching, refetch } = useGetUsersListQuery({
    page,
    paginate,
    search: q,
    // role_id: DEFAULT_LIST_ROLE_ID,
  });

  const items: Users[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // dialog states
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);
  const [openPassForId, setOpenPassForId] = useState<number | null>(null);

  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [validateEmail, { isLoading: validatingEmail }] =
    useValidateUserEmailMutation();
  const [validatePhone, { isLoading: validatingPhone }] =
    useValidateUserPhoneMutation();

  // debounce search → reset ke page 1
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus user?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0ea5e9",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteUser(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User dihapus.",
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

  return (
    <>
      <SiteHeader title="Manajemen User" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Cari nama/email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            <select
              className="h-9 rounded-xl border bg-background px-2"
              value={paginate}
              onChange={(e) => setPaginate(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setPage(1);
                void refetch();
              }}
            >
              Reset
            </Button>
          </div>

          <Button
            variant="default"
            onClick={() => setOpenForm({ mode: "create" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Corporate</th>
                  {/* <th className="px-4 py-3">Created At</th> */}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-zinc-500"
                      colSpan={6}
                    >
                      Memuat data…
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3 md:text-sm align-middle">
                        <div className="font-semibold md:text-xs">{u.referral}</div>
                      </td>
                      <td className="px-4 py-3 md:text-sm align-middle">
                        <div className="font-semibold md:text-xs">{u.name}</div>
                      </td>
                      <td className="px-4 py-3 md:text-sm align-middle">{u.email}</td>
                      <td className="px-4 py-3 md:text-sm align-middle">{u.phone ?? "-"}</td>
                      <td className="px-4 py-3 md:text-sm align-middle">
                        {u.roles?.map((r) => r.name).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 md:text-sm align-middle">
                        {u.is_corporate ? "Yes" : "No"}
                      </td>
                      {/* <td className="px-4 py-3 text-xs align-middle">{formatDate(u.created_at)}</td> */}
                      <td className="px-4 py-2 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpenPassForId(u.id)}
                            title="Ubah Password"
                            className="bg-white hover:bg-[#4A90E2] text-[#4A90E2] hover:text-white border border-[#4A90E2] rounded-xl h-10 w-10 p-0 transition-all"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setOpenForm({ mode: "edit", id: u.id })
                            }
                            className="bg-white hover:bg-[#4A90E2] text-[#4A90E2] hover:text-white border border-[#4A90E2] rounded-xl h-10 w-10 p-0 transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting}
                            title="Hapus"
                            className="bg-white hover:bg-red-500 text-red-500 hover:text-white border border-red-500 rounded-xl h-10 w-10 p-0 transition-all"
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
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={6}
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-zinc-600">
            <div>
              Total {total} data • Halaman {page} dari {lastPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Create / Edit */}
        {openForm && (
          <UsersForm
            open
            mode={openForm.mode}
            id={openForm.id}
            // default role boleh dikirim tapi sudah bisa diubah di combobox
            defaultRoleId={DEFAULT_LIST_ROLE_ID}
            onClose={() => setOpenForm(null)}
            onSuccess={() => {
              setOpenForm(null);
              void refetch();
            }}
          />
        )}

        {/* Password dialog */}
        {openPassForId != null && (
          <PasswordDialog
            open
            id={openPassForId}
            onClose={() => setOpenPassForId(null)}
            onSuccess={() => {
              setOpenPassForId(null);
              void refetch();
            }}
          />
        )}
      </div>
    </>
  );
}