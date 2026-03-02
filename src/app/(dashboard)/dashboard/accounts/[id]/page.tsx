"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecordForm } from "@/features/records";
import { WalletEditForm } from "@/features/accounts/components/wallet-edit-form";
import { trpc } from "@/lib/trpc/client";
import {
  WalletDetailHeader,
  WalletBalanceTrendCard,
  WalletNotesCard,
  WalletHistoryList,
} from "@/features/accounts/components";

interface WalletDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WalletDetailPage({ params }: WalletDetailPageProps) {
  const { id: walletId } = use(params);
  const router = useRouter();
  const [recordOpen, setRecordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<{
    id: string;
    amount: number;
    date: string;
    notes: string | null;
  } | null>(null);

  const { data: wallet, isLoading: walletLoading } =
    trpc.accounts.getById.useQuery({ id: walletId });

  const utils = trpc.useUtils();

  const updateRecordMutation = trpc.records.update.useMutation({
    onSuccess: () => {
      toast.success("Record updated successfully");
      utils.records.getByWalletId.invalidate({ walletId });
      utils.accounts.getById.invalidate({ id: walletId });
      utils.accounts.getAll.invalidate();
      utils.charts.getWalletChartData.invalidate({ walletId });
      setRecordToEdit(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update record");
    },
  });

  const deleteWalletMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Wallet deleted successfully");
      utils.accounts.getAll.invalidate();
      router.push("/accounts");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete wallet");
    },
  });

  const handleDeleteWallet = async () => {
    await deleteWalletMutation.mutateAsync({ id: walletId });
  };

  const handleSaveEdit = async () => {
    if (!recordToEdit) return;
    await updateRecordMutation.mutateAsync({
      id: recordToEdit.id,
      data: {
        amount: recordToEdit.amount,
        date: recordToEdit.date,
        notes: recordToEdit.notes || undefined,
      },
    });
  };

  if (walletLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/accounts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
        <p className="text-muted-foreground">Wallet not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/accounts")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Accounts
      </Button>

      <WalletDetailHeader
        wallet={wallet}
        onAddRecordOpen={() => setRecordOpen(true)}
        onEditOpen={() => setEditOpen(true)}
        onDeleteOpen={() => setDeleteOpen(true)}
      />

      <WalletBalanceTrendCard walletId={walletId} />

      {wallet.notes && <WalletNotesCard wallet={wallet} />}

      <WalletHistoryList
        walletId={walletId}
        onEditRecordOpen={setRecordToEdit}
      />

      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Balance Record</DialogTitle>
          </DialogHeader>
          <RecordForm
            walletId={walletId}
            onSuccess={() => setRecordOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
          </DialogHeader>
          <WalletEditForm id={walletId} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!recordToEdit} onOpenChange={() => setRecordToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {recordToEdit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    value={recordToEdit.amount}
                    onChange={(e) =>
                      setRecordToEdit({
                        ...recordToEdit,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={recordToEdit.date}
                    onChange={(e) =>
                      setRecordToEdit({
                        ...recordToEdit,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={recordToEdit.notes || ""}
                  onChange={(e) =>
                    setRecordToEdit({
                      ...recordToEdit,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRecordToEdit(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateRecordMutation.isPending}
                >
                  {updateRecordMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallet</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this wallet? All records will be
            deleted too.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWallet}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
