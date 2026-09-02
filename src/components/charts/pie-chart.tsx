"use client";

import { PieChart, Pie } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

export interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

interface PieChartComponentProps {
  data: PieChartData[];
  config?: ChartConfig;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const defaultConfig = {
  wallets: {
    label: "Wallets",
  },
} satisfies ChartConfig;

export function PieChartComponent({
  data,
  config = defaultConfig,
}: PieChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-50 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: item.fill || COLORS[index % COLORS.length],
  }));

  return (
    <ChartContainer config={config} className="min-h-37.5 w-full">
      <PieChart>
        <Pie
          data={dataWithColors}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          innerRadius={40}
          label={({ percent }) => percent && `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent nameKey="name" hideLabel />}
        />

        <ChartLegend
          content={
            <ChartLegendContent
              nameKey="name"
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          }
        />
      </PieChart>
    </ChartContainer>
  );
}
