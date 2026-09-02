"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { LineChartComponent, PieChartComponent } from "@/components/charts";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");

  const { data: wallets, isLoading } = trpc.accounts.getAll.useQuery();
  const { data: globalChartData, isLoading: globalChartLoading } =
    trpc.charts.getGlobalChartData.useQuery({ period });
  const { data: walletDistribution, isLoading: distributionLoading } =
    trpc.charts.getWalletDistribution.useQuery();
  const { data: comparison } = trpc.charts.getBalanceComparison.useQuery();

  const totalBalance =
    wallets?.reduce((sum, w) => sum + (w.currentBalance ?? 0), 0) ?? 0;
  const walletCount = wallets?.length ?? 0;
  const recordCount =
    wallets?.reduce((sum, w) => sum + (w._count?.records ?? 0), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            {comparison && comparison.changePercent !== null ? (
              <div className=" flex items-center gap-1">
                <span
                  className={`mt-1 flex items-center gap-1 text-sm font-medium border rounded-full px-2 ${
                    comparison.direction === "up"
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500"
                      : comparison.direction === "down"
                        ? "text-red-500 bg-red-500/10 border-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {comparison.direction === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : comparison.direction === "down" ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {comparison.direction === "up" ? "+" : ""}
                  {comparison.changePercent}%{" "}
                </span>
                <p className="text-muted-foreground text-sm">vs last month</p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={period}
              onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}
            >
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="mt-4">
                {globalChartLoading ? (
                  <div className="h-37.5 bg-muted animate-pulse rounded" />
                ) : (
                  <LineChartComponent data={globalChartData || []} />
                )}
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                {globalChartLoading ? (
                  <div className="h-37.5 bg-muted animate-pulse rounded" />
                ) : (
                  <LineChartComponent data={globalChartData || []} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionLoading ? (
              <div className="h-37.5 bg-muted animate-pulse rounded" />
            ) : (
              <PieChartComponent data={walletDistribution || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
