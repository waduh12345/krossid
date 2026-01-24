"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combo-box";
import {
  useCreateTopSaleMutation,
  useGetTopSaleByIdQuery,
  useUpdateTopSaleMutation,
} from "@/services/programs/top-sales.service";
import { useGetUsersListQuery } from "@/services/users-management.service";
import Swal from "sweetalert2";
import { X, Loader2, Hash, Trophy, ToggleLeft, ToggleRight, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  user_id: number | null;
  order: number;
  status: boolean;
};

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function TopSalesForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  // Fetch Lists
  const { data: usersResp, isLoading: loadingUsers, refetch: refetchUsers } = useGetUsersListQuery({
    page: 1,
    paginate: 100,
  });

  // Fetch Detail
  const { data: topSaleData, isLoading: loadingDetail } = useGetTopSaleByIdQuery(id!, {
    skip: !isEdit || !id,
  });

  // Mutations
  const [createTopSale, { isLoading: creating }] = useCreateTopSaleMutation();
  const [updateTopSale, { isLoading: updating }] = useUpdateTopSaleMutation();

  const [form, setForm] = useState<FormState>({
    user_id: null,
    order: 1,
    status: true,
  });

  const [searchUser, setSearchUser] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (isEdit && topSaleData) {
      setForm({
        user_id: topSaleData.user_id,
        order: topSaleData.order,
        status: topSaleData.status === 1 || topSaleData.status === true,
      });
    } else {
      setForm({
        user_id: null,
        order: 1,
        status: true,
      });
    }
  }, [isEdit, topSaleData]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    const users = usersResp?.data || [];
    if (!searchUser) return users;
    const searchLower = searchUser.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.phone?.toLowerCase().includes(searchLower)
    );
  }, [usersResp, searchUser]);

  const isLoading = loadingDetail || creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.user_id) {
      Swal.fire({
        icon: "warning",
        title: "User Required",
        text: "Please select a user",
        confirmButtonColor: "#3b82f6",
        customClass: {
          container: 'swal2-z-index-fix'
        }
      });
      return;
    }

    if (form.order < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Order",
        text: "Order must be at least 1",
        confirmButtonColor: "#3b82f6",
        customClass: {
          container: 'swal2-z-index-fix'
        }
      });
      return;
    }

    try {
      const payload = {
        user_id: form.user_id,
        order: form.order,
        status: form.status ? 1 : 0,
      };

      if (isEdit && id) {
        await updateTopSale({ id, payload }).unwrap();
      } else {
        await createTopSale(payload).unwrap();
      }

      // Close modal first, then show notification
      onClose();
      
      // Wait for modal to close, then show notification
      setTimeout(async () => {
        await Swal.fire({
          icon: "success",
          title: isEdit ? "Updated!" : "Created!",
          text: isEdit 
            ? "Top sale has been updated." 
            : "Top sale has been created.",
          confirmButtonColor: "#10b981",
          timer: 2000,
          timerProgressBar: true,
        });
        onSuccess();
      }, 150);
    } catch (err) {
      // Close modal first, then show error notification
      onClose();
      const error = err as ApiError;
      
      // Wait for modal to close, then show notification
      setTimeout(async () => {
        await Swal.fire({
          icon: "error",
          title: isEdit ? "Update Failed" : "Create Failed",
          text: error?.data?.message || "Something went wrong.",
          confirmButtonColor: "#ef4444",
        });
      }, 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            {isEdit ? "Edit Top Sale" : "Create Top Sale"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user_id" className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4" />
              User <span className="text-red-500">*</span>
            </Label>
            <Combobox
              value={form.user_id}
              onChange={(value) => setForm({ ...form, user_id: value })}
              onSearchChange={setSearchUser}
              onOpenRefetch={() => refetchUsers()}
              data={filteredUsers}
              isLoading={loadingUsers}
              placeholder="Select a user..."
              getOptionLabel={(item) => {
                const user = item as any;
                return `${user.name || 'N/A'}${user.email ? ` (${user.email})` : ""}`;
              }}
            />
            {form.user_id && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {filteredUsers.find((u) => u.id === form.user_id)?.name || 'N/A'}
              </p>
            )}
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order" className="text-sm font-bold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="order"
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
              placeholder="Enter order (1, 2, 3...)"
              className="rounded-xl"
              required
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in the top sales list
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-bold flex items-center gap-2">
              {form.status ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              Status
            </Label>
            <div className="flex items-center gap-3">
              <Switch
                id="status"
                checked={form.status}
                onCheckedChange={(checked) => setForm({ ...form, status: checked })}
              />
              <span className="text-sm text-gray-600">
                {form.status ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Only active top sales will be displayed publicly
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.user_id}
              className="bg-yellow-600 hover:bg-yellow-700 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
