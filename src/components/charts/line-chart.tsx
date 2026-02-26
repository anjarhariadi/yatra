"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

export interface LineChartData {
  date: string
  balance: number
}

interface LineChartComponentProps {
  data: LineChartData[]
  config?: ChartConfig
}

const defaultConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function LineChartComponent({
  data,
  config = defaultConfig,
}: LineChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <ChartContainer config={config} className="min-h-[150px] w-full">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value) =>
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              notation: "compact",
              maximumFractionDigits: 0,
            }).format(value)
          }
          className="text-xs"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--color-balance)"
          strokeWidth={2}
          dot={{ fill: "var(--color-balance)", strokeWidth: 2 }}
          activeDot={{ r: 4 }}
        />
        <ChartTooltipContent
          formatter={(value) => formatCurrency(value as number)}
          labelFormatter={(label) => `Date: ${label}`}
        />
      </LineChart>
    </ChartContainer>
  )
}
