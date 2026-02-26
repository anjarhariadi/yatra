"use client"

import { PieChart, Pie, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

export interface PieChartData {
  name: string
  value: number
  fill: string
}

interface PieChartComponentProps {
  data: PieChartData[]
  config?: ChartConfig
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

const defaultConfig = {
  wallets: {
    label: "Wallets",
  },
} satisfies ChartConfig

export function PieChartComponent({
  data,
  config = defaultConfig,
}: PieChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: item.fill || COLORS[index % COLORS.length],
  }))

  return (
    <ChartContainer config={config} className="min-h-[150px] w-full">
      <PieChart>
        <Pie
          data={dataWithColors}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltipContent
          formatter={(value) => formatCurrency(value as number)}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          verticalAlign="bottom"
        />
      </PieChart>
    </ChartContainer>
  )
}
