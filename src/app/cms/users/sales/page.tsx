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
  Pencil,
  Trash2,
  KeyRound,
  Loader2,
  Users,
  Mail,
  Phone,
  Building2,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetUsersListQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/services/users-management.service";
import type { User } from "@/types/user";
import UsersForm from "@/components/form-modal/users-form";
import PasswordDialog from "@/components/modal/users-password-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const PER_PAGE = 10;
const DEFAULT_LIST_ROLE_ID = 2; // Sales role

type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

export default function SalesUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check if user is director or manager, redirect if not
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    if (status === "authenticated" && userRole !== "director" && userRole !== "manager") {
      router.replace("/cms/dashboard");
      
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Akses Ditolak",
          text: "Hanya Director dan Manager yang dapat mengakses halaman Manajemen Sales.",
          confirmButtonColor: "#3b82f6",
          timer: 3000,
          timerProgressBar: true,
        });
      }, 300);
    }
  }, [status, userRole, router]);

  const { data, isFetching, refetch } = useGetUsersListQuery({
    page,
    paginate,
    search: q,
    role_id: DEFAULT_LIST_ROLE_ID, // Filter hanya sales
  });

  const items: User[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // Filter by status
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((u) => {
      if (statusFilter === "active") return u.status === 1;
      if (statusFilter === "inactive") return u.status === 0;
      if (statusFilter === "waiting") return u.status === 2;
      if (statusFilter === "rejected") return u.status === -1;
      return true;
    });
  }, [items, statusFilter]);

  // Dialog states
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);
  const [openPassForId, setOpenPassForId] = useState<number | null>(null);

  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: updatingStatus }] = useUpdateUserMutation();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate, statusFilter]);

  // Get status badge
  const getStatusBadge = (status: number | boolean | undefined) => {
    if (status === 1) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (status === 2) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Waiting Approval
        </Badge>
      );
    }
    if (status === -1) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus Sales?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteUser(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Sales berhasil dihapus.",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
        confirmButtonColor: "#ef4444",
      });
    }
  }

  async function handleStatusChange(id: number, currentStatus: number | boolean | undefined, newStatus: number) {
    try {
      await updateUser({
        id,
        payload: { status: newStatus },
      }).unwrap();
      
      await Swal.fire({
        icon: "success",
        title: "Status Diubah",
        text: "Status sales berhasil diperbarui.",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal mengubah status",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
        confirmButtonColor: "#ef4444",
      });
    }
  }

  // Show loading while checking session
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

  // Only render content if user is authenticated and is director or manager
  if (status !== "authenticated" || (userRole !== "director" && userRole !== "manager")) {
    return null;
  }

  const isDirector = userRole === "director";
  const isManager = userRole === "manager";

  // Stats
  const stats = useMemo(() => {
    const active = items.filter((u) => u.status === 1).length;
    const inactive = items.filter((u) => u.status === 0).length;
    const waiting = items.filter((u) => u.status === 2).length;
    const rejected = items.filter((u) => u.status === -1).length;
    return { active, inactive, waiting, rejected, total: items.length };
  }, [items]);

  return (
    <>
      <SiteHeader title="Manajemen Sales" />
      <div className="space-y-6 px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                  Total Sales
                </p>
                <p className="text-2xl font-black text-blue-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
                  Active
                </p>
                <p className="text-2xl font-black text-green-900">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">
                  Waiting
                </p>
                <p className="text-2xl font-black text-yellow-900">{stats.waiting}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">
                  Rejected
                </p>
                <p className="text-2xl font-black text-red-900">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                  Inactive
                </p>
                <p className="text-2xl font-black text-gray-900">{stats.inactive}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap w-full items-center gap-3 md:w-auto">
              <div className="relative flex-1 md:flex-none md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
                <Input
                  placeholder="Cari nama, email, atau phone..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
                <select
                  className="h-9 rounded-xl border bg-background px-3 pl-9 text-sm font-medium"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Active</option>
                  <option value="waiting">Waiting Approval</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <select
                className="h-9 rounded-xl border bg-background px-2 text-sm"
                value={paginate}
                onChange={(e) => setPaginate(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setQ("");
                  setStatusFilter("all");
                  setPage(1);
                  void refetch();
                }}
                title="Reset Filter"
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Button - Only for Manager */}
            {isManager && (
              <Button
                variant="default"
                onClick={() => setOpenForm({ mode: "create" })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Sales
              </Button>
            )}
          </div>
        </Card>

        {/* User Cards Grid */}
        {isFetching && !filteredItems.length ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Memuat data sales...</p>
            </div>
          </Card>
        ) : filteredItems.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((u) => (
              <Card
                key={u.id}
                className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                          {u.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-lg text-gray-900 truncate">
                            {u.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono truncate">
                            {u.referral || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(u.status)}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{u.phone}</span>
                      </div>
                    )}
                    {u.is_corporate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">Corporate Account</span>
                      </div>
                    )}
                    {u.roles && u.roles.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {u.roles.map((r: { name: string }) => r.name).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    {/* Status Change - Only for Director */}
                    {isDirector && (
                      <div className="flex-1">
                        <select
                          value={u.status === 1 ? 1 : u.status === 2 ? 2 : u.status === -1 ? -1 : 0}
                          onChange={(e) =>
                            handleStatusChange(u.id, u.status, Number(e.target.value))
                          }
                          disabled={updatingStatus}
                          className="w-full h-9 rounded-lg border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>Active</option>
                          <option value={2}>Waiting Approval</option>
                          <option value={-1}>Rejected</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>
                    )}

                    {/* Manager Actions */}
                    {isManager && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenPassForId(u.id)}
                          title="Ubah Password"
                          className="h-9 px-3 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenForm({ mode: "edit", id: u.id })}
                          title="Edit"
                          className="h-9 px-3 rounded-lg border-sky-200 text-sky-600 hover:bg-sky-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting}
                          title="Hapus"
                          className="h-9 px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Users className="h-16 w-16 text-gray-300" />
              <div className="text-center">
                <p className="font-bold text-gray-700 text-lg">Tidak ada data sales</p>
                <p className="text-sm text-gray-500 mt-1">
                  {q || statusFilter !== "all"
                    ? "Coba ubah filter atau pencarian Anda"
                    : "Belum ada sales yang terdaftar"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {filteredItems.length > 0 && (
          <Card className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-bold text-gray-900">{filteredItems.length}</span> dari{" "}
                <span className="font-bold text-gray-900">{total}</span> sales • Halaman{" "}
                <span className="font-bold text-gray-900">{page}</span> dari{" "}
                <span className="font-bold text-gray-900">{lastPage}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="rounded-xl"
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Create / Edit Modal - Only for Manager */}
        {isManager && openForm && (
          <UsersForm
            open
            mode={openForm.mode}
            id={openForm.id}
            defaultRoleId={DEFAULT_LIST_ROLE_ID}
            disableStatus={true} // Manager cannot change status
            onClose={() => setOpenForm(null)}
            onSuccess={() => {
              setOpenForm(null);
              void refetch();
            }}
          />
        )}

        {/* Password Dialog - Only for Manager */}
        {isManager && openPassForId != null && (
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
