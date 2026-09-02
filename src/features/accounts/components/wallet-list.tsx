"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQueryState } from "nuqs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { WalletForm } from "./wallet-form";
import { WalletFilters, WalletFiltersSheet } from "./wallet-filters";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import { categoryBadgeStyle } from "@/features/categories/validation";
import { sortOptions } from "../query-state";

export function WalletList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [sort] = useQueryState("sort", sortOptions.sort);
  const [category] = useQueryState("category", sortOptions.category);
  const [type] = useQueryState("type", sortOptions.type);

  const { data: wallets, isLoading } = trpc.accounts.getAll.useQuery();

  const filtered = (wallets ?? [])
    .filter((w) => category.length === 0 || category.includes(w.categoryId))
    .filter((w) => type.length === 0 || type.includes(w.category.type))
    .sort((a, b) => {
      const diff = (a.currentBalance ?? 0) - (b.currentBalance ?? 0);
      return sort === "asc" ? diff : -diff;
    });

  const filteredTotal = filtered.reduce(
    (sum, w) => sum + (w.currentBalance ?? 0),
    0,
  );

  const addWalletButton = (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Wallet</DialogTitle>
        </DialogHeader>
        <WalletForm onSuccess={() => setCreateOpen(false)} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <WalletFiltersSheet />
            {wallets && (
              <span className="text-muted-foreground text-sm font-normal">
                {filtered.length}/{wallets.length} shown
              </span>
            )}
          </div>
          {addWalletButton}
        </div>

        {isLoading ? (
          <div className="space-y-1 rounded-md border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No wallets{" "}
            {wallets?.length
              ? "match your filters"
              : "yet. Create one to get started."}
          </p>
        ) : (
          <ItemGroup className=" space-y-3">
            {filtered.map((wallet) => (
              <Item
                key={wallet.id}
                asChild
                size="sm"
                className=" bg-sidebar border"
              >
                <Link href={`/dashboard/accounts/${wallet.id}`}>
                  <ItemMedia
                    variant="image"
                    className="relative overflow-hidden"
                  >
                    {wallet.imageUrl ? (
                      <Image
                        src={wallet.imageUrl}
                        alt={wallet.name}
                        fill
                        sizes="32"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {wallet.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-sm">{wallet.name}</ItemTitle>
                    <ItemDescription
                      className="text-xs px-1.5 py-0.5 rounded-full border w-fit"
                      style={categoryBadgeStyle(wallet.category.color)}
                    >
                      {wallet.category.name}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="font-mono text-sm font-medium">
                      {formatCurrency(wallet.currentBalance ?? 0)}
                    </span>
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </ItemGroup>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Total ({filtered.length})
            </span>
            <span className="font-mono text-sm text-emerald-500 font-semibold">
              {formatCurrency(filteredTotal)}
            </span>
          </div>
        )}
      </div>

      <div className="hidden lg:block lg:w-72 shrink-0">
        <WalletFilters />
      </div>
    </div>
  );
}
