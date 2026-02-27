"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

interface WalletHistoryListProps {
  walletId: string;
  onEditRecordOpen: (record: {
    id: string;
    amount: number;
    date: string;
    notes: string | null;
  }) => void;
}

export function WalletHistoryList({
  walletId,
  onEditRecordOpen,
}: WalletHistoryListProps) {
  const { data: records, isLoading: recordsLoading } =
    trpc.records.getByWalletId.useQuery({ walletId });

  const utils = trpc.useUtils();

  const deleteRecordMutation = trpc.records.delete.useMutation({
    onSuccess: () => {
      utils.accounts.getById.invalidate({ id: walletId });
      utils.accounts.getAll.invalidate();
      utils.charts.getWalletChartData.invalidate({ walletId });
    },
  });

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }
    await deleteRecordMutation.mutateAsync({ id });
  };

  return (
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
                    onEditRecordOpen({
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
  );
}
