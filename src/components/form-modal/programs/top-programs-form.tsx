"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combo-box";
import {
  useCreateTopProgramMutation,
  useGetTopProgramByIdQuery,
  useUpdateTopProgramMutation,
} from "@/services/programs/top.service";
import { useGetProgramsQuery } from "@/services/programs/programs.service";
import Swal from "sweetalert2";
import { X, Loader2, Hash, TrendingUp, ToggleLeft, ToggleRight } from "lucide-react";
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
  program_id: number | null;
  order: number;
  status: boolean;
};

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function TopProgramsForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  // Fetch Lists
  const { data: programsResp, isLoading: loadingPrograms, refetch: refetchPrograms } = useGetProgramsQuery({
    page: 1,
    paginate: 100,
  });

  // Fetch Detail
  const { data: topProgramData, isLoading: loadingDetail } = useGetTopProgramByIdQuery(id!, {
    skip: !isEdit || !id,
  });

  // Mutations
  const [createTopProgram, { isLoading: creating }] = useCreateTopProgramMutation();
  const [updateTopProgram, { isLoading: updating }] = useUpdateTopProgramMutation();

  const [form, setForm] = useState<FormState>({
    program_id: null,
    order: 1,
    status: true,
  });

  const [searchProgram, setSearchProgram] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (isEdit && topProgramData) {
      setForm({
        program_id: topProgramData.program_id,
        order: topProgramData.order,
        status: topProgramData.status === 1 || topProgramData.status === true,
      });
    } else {
      setForm({
        program_id: null,
        order: 1,
        status: true,
      });
    }
  }, [isEdit, topProgramData]);

  // Filter programs based on search
  const filteredPrograms = useMemo(() => {
    const programs = programsResp?.data || [];
    if (!searchProgram) return programs;
    const searchLower = searchProgram.toLowerCase();
    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower) ||
        p.owner_name?.toLowerCase().includes(searchLower)
    );
  }, [programsResp, searchProgram]);

  const isLoading = loadingDetail || creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.program_id) {
      Swal.fire({
        icon: "warning",
        title: "Program Required",
        text: "Please select a program",
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
        program_id: form.program_id,
        order: form.order,
        status: form.status ? 1 : 0,
      };

      if (isEdit && id) {
        await updateTopProgram({ id, payload }).unwrap();
      } else {
        await createTopProgram(payload).unwrap();
      }

      // Close modal first, then show notification
      onClose();
      
      // Wait for modal to close, then show notification
      setTimeout(async () => {
        await Swal.fire({
          icon: "success",
          title: isEdit ? "Updated!" : "Created!",
          text: isEdit 
            ? "Top program has been updated." 
            : "Top program has been created.",
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
            <TrendingUp className="h-6 w-6 text-blue-600" />
            {isEdit ? "Edit Top Program" : "Create Top Program"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Program Selection */}
          <div className="space-y-2">
            <Label htmlFor="program_id" className="text-sm font-bold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Program <span className="text-red-500">*</span>
            </Label>
            <Combobox
              value={form.program_id}
              onChange={(value) => setForm({ ...form, program_id: value })}
              onSearchChange={setSearchProgram}
              onOpenRefetch={() => refetchPrograms()}
              data={filteredPrograms}
              isLoading={loadingPrograms}
              placeholder="Select a program..."
              getOptionLabel={(item) => {
                const program = item as any;
                return `${program.title}${program.owner_name ? ` - ${program.owner_name}` : ""}`;
              }}
            />
            {form.program_id && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {filteredPrograms.find((p) => p.id === form.program_id)?.title}
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
              Lower numbers appear first in the top programs list
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
              Only active top programs will be displayed publicly
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
              disabled={isLoading || !form.program_id}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
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
