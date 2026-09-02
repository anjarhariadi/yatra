"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { LineChartComponent, PieChartComponent } from "@/components/charts";

interface Comparison {
  changePercent: number | null;
  direction: "up" | "down" | "flat";
}

function ComparisonBadge({ comparison }: { comparison?: Comparison }) {
  if (!comparison || comparison.changePercent === null) {
    return <p className="mt-1 text-sm text-muted-foreground">No data yet</p>;
  }
  return (
    <div className="flex items-center gap-1">
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
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");

  const { data: dashboard, isLoading } =
    trpc.charts.getDashboardData.useQuery();

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboard?.totalBalance ?? 0)}
            </div>
            <ComparisonBadge comparison={dashboard?.comparison} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hot Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboard?.hotMoney ?? 0)}
            </div>
            <ComparisonBadge comparison={dashboard?.hotMoneyComparison} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.walletCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.recordCount ?? 0}</div>
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
                <LineChartComponent data={dashboard?.weeklyChartData || []} />
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                <LineChartComponent data={dashboard?.monthlyChartData || []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={dashboard?.distribution || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
