"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useCreatePackageRegistrationMutation,
  useGetPackageRegistrationByIdQuery,
  useUpdatePackageRegistrationMutation,
} from "@/services/package/registration.service";
import { useGetPackagesQuery } from "@/services/package/package.service";
import { useGetUsersListQuery } from "@/services/users-management.service";
import type { PackageRegistrationStorePayload } from "@/types/package/registration";
import type { Package } from "@/types/package/package";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  package_id: number | null;
  user_id: number | null;
  status: number;
};

interface ApiError {
  data?: { message?: string };
}

interface UserOption {
  id: number;
  name?: string;
  email?: string;
}

export default function PackageRegistrationForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching: fetchingDetail } =
    useGetPackageRegistrationByIdQuery(id ?? 0, {
      skip: !isEdit || !id,
    });

  const [createRegistration, { isLoading: creating }] =
    useCreatePackageRegistrationMutation();
  const [updateRegistration, { isLoading: updating }] =
    useUpdatePackageRegistrationMutation();

  const { data: packagesResp } = useGetPackagesQuery({
    page: 1,
    paginate: 100,
    search: "",
  });
  const { data: usersResp } = useGetUsersListQuery({
    page: 1,
    paginate: 100,
  });

  const packages: Package[] = useMemo(
    () => (packagesResp?.data ?? []) as Package[],
    [packagesResp]
  );
  const users: UserOption[] = useMemo(
    () => (usersResp?.data ?? []) as UserOption[],
    [usersResp]
  );

  const initial: FormState = useMemo(
    () => ({
      package_id: detail?.package_id ?? null,
      user_id: detail?.user_id ?? null,
      status:
        detail?.status === 1 || detail?.status === true ? 1 : 0,
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.package_id == null || form.package_id === 0) {
      await Swal.fire({ icon: "warning", title: "Package is required" });
      return;
    }

    const payload: PackageRegistrationStorePayload = {
      package_id: form.package_id,
      user_id: form.user_id,
      status: form.status,
    };

    try {
      if (isEdit && id) {
        await updateRegistration({ id, payload }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Registration Updated",
        });
      } else {
        await createRegistration(payload).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Registration Created",
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as ApiError;
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message ?? "Request failed",
      });
    }
  }

  if (!open) return null;

  const loading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Registration" : "Create Registration"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {fetchingDetail ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="package_id">Package *</Label>
              <select
                id="package_id"
                value={form.package_id ?? ""}
                onChange={(e) =>
                  set("package_id", e.target.value ? Number(e.target.value) : null)
                }
                className="h-9 w-full rounded-xl border bg-background px-3 text-sm"
                required
              >
                <option value="">Select package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_id">User</Label>
              <select
                id="user_id"
                value={form.user_id ?? ""}
                onChange={(e) =>
                  set("user_id", e.target.value ? Number(e.target.value) : null)
                }
                className="h-9 w-full rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">No user (optional)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ?? u.email ?? `User #${u.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set("status", Number(e.target.value))}
                className="h-9 w-full rounded-xl border bg-background px-3 text-sm"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
