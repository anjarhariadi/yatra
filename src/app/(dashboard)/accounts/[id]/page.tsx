"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecordForm } from "@/features/records";
import { WalletEditForm } from "@/features/accounts/components/wallet-edit-form";
import { trpc } from "@/lib/trpc/client";
import { LineChartComponent } from "@/components/charts";
import Image from "next/image";

interface WalletDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WalletDetailPage({ params }: WalletDetailPageProps) {
  const { id: walletId } = use(params);
  const router = useRouter();
  const [recordOpen, setRecordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [recordToEdit, setRecordToEdit] = useState<{
    id: string;
    amount: number;
    date: string;
    notes: string | null;
  } | null>(null);

  const { data: wallet, isLoading: walletLoading } =
    trpc.accounts.getById.useQuery({ id: walletId });

  const { data: records, isLoading: recordsLoading } =
    trpc.records.getByWalletId.useQuery({ walletId });

  const { data: chartData, isLoading: chartLoading } =
    trpc.charts.getWalletChartData.useQuery({ walletId, period });

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

  const deleteRecordMutation = trpc.records.delete.useMutation({
    onSuccess: () => {
      toast.success("Record deleted successfully");
      utils.accounts.getById.invalidate({ id: walletId });
      utils.accounts.getAll.invalidate();
      utils.charts.getWalletChartData.invalidate({ walletId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete record");
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

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }
    await deleteRecordMutation.mutateAsync({ id });
  };

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
      <Button variant="ghost" onClick={() => router.push("/accounts")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Accounts
      </Button>

      <div className="flex gap-4 items-start justify-between">
        <div className="flex items-center gap-4">
          {wallet.imageUrl ? (
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={wallet.imageUrl}
                alt={wallet.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl">
              {wallet.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{wallet.name}</h1>
            <span className="text-sm px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {wallet.category.name}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(wallet.currentBalance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {wallet.records.length > 0
                  ? `Last updated: ${formatDate(wallet.records[0].date)}`
                  : "No records yet"}
              </p>
            </div>
            <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Update Balance
                </Button>
              </DialogTrigger>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly" className="mt-4">
              {chartLoading ? (
                <div className="h-[150px] bg-muted animate-pulse rounded" />
              ) : (
                <LineChartComponent data={chartData || []} />
              )}
            </TabsContent>
            <TabsContent value="monthly" className="mt-4">
              {chartLoading ? (
                <div className="h-[150px] bg-muted animate-pulse rounded" />
              ) : (
                <LineChartComponent data={chartData || []} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {wallet.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{wallet.notes}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Balance History</h2>
        {recordsLoading ? (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : records && records.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground w-24 shrink-0">
                  {formatDate(record.date)}
                </span>
                <span className="font-medium text-sm">
                  {formatCurrency(record.amount)}
                </span>
                <span className="text-sm text-muted-foreground flex-1 truncate mx-4">
                  {record.notes || "-"}
                </span>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      setRecordToEdit({
                        id: record.id,
                        amount: record.amount,
                        date: new Date(record.date).toISOString().split("T")[0],
                        notes: record.notes ?? "",
                      })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No records yet. Add your first balance record.
          </p>
        )}
      </div>

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
