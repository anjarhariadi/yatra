import { Pencil, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletRecord {
  id: string;
  amount: number;
  date: string;
  notes: string | null;
  walletId: string;
  createdAt: string;
}

interface WalletCategory {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletDetailHeaderProps {
  wallet: {
    id: string;
    name: string;
    notes: string | null;
    imageUrl: string | null;
    category: WalletCategory;
    records: WalletRecord[];
    currentBalance: number;
  };
  onAddRecordOpen: () => void;
  onEditOpen: () => void;
  onDeleteOpen: () => void;
}

export function WalletDetailHeader({
  wallet,
  onAddRecordOpen,
  onEditOpen,
  onDeleteOpen,
}: WalletDetailHeaderProps) {
  return (
    <>
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
          <Button variant="outline" size="sm" onClick={onEditOpen}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteOpen}>
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
            <Button onClick={onAddRecordOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Update Balance
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
