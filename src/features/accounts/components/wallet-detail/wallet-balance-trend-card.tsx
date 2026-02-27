"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts";
import { trpc } from "@/lib/trpc/client";

interface WalletBalanceTrendCardProps {
  walletId: string;
}

export function WalletBalanceTrendCard({ walletId }: WalletBalanceTrendCardProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");

  const { data: chartData, isLoading: chartLoading } =
    trpc.charts.getWalletChartData.useQuery({ walletId, period });

  return (
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
  );
}
