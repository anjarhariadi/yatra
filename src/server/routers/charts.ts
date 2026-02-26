import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"

const periodSchema = z.enum(["weekly", "monthly"])

function getSaturdayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 6 ? 0 : 6 - day
  const saturday = new Date(d)
  saturday.setDate(d.getDate() + diff)
  saturday.setHours(23, 59, 59, 999)
  return saturday
}

function getMonthEndDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function generateWeeklyPeriods(startDate: Date, endDate: Date): Date[] {
  const periods: Date[] = []
  const start = getSaturdayOfWeek(startDate)
  const end = getSaturdayOfWeek(endDate)
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000

  const startMs = start.getTime()
  const endMs = end.getTime()

  for (let ms = startMs; ms <= endMs; ms += oneWeekMs) {
    periods.push(new Date(ms))
  }

  return periods
}

function generateMonthlyPeriods(startDate: Date, endDate: Date): Date[] {
  const periods: Date[] = []
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  let currentYear = start.getFullYear()
  let currentMonth = start.getMonth()

  while (
    currentYear < end.getFullYear() ||
    (currentYear === end.getFullYear() && currentMonth <= end.getMonth())
  ) {
    periods.push(getMonthEndDate(new Date(currentYear, currentMonth, 1)))
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
  }

  return periods
}

function findClosestRecord(
  records: { date: Date; amount: number; createdAt?: Date }[],
  targetDate: Date
): number | null {
  const validRecords = records
    .filter((r) => r.date <= targetDate)
    .sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime()
      if (dateDiff !== 0) return dateDiff
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
      return 0
    })

  if (validRecords.length === 0) {
    return null
  }

  return validRecords[0].amount
}

export const chartsRouter = createTRPCRouter({
  getWalletChartData: protectedProcedure
    .input(
      z.object({
        walletId: z.string(),
        period: periodSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findFirst({
        where: {
          id: input.walletId,
          userId: ctx.user!.id,
        },
      })

      if (!wallet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        })
      }

      const records = await ctx.db.record.findMany({
        where: {
          walletId: input.walletId,
        },
        orderBy: [
          { date: "asc" },
          { createdAt: "asc" },
        ],
      })

      if (records.length === 0) {
        return []
      }

      const recordDates = records.map((r) => ({
        date: new Date(r.date),
        amount: Number(r.amount),
        createdAt: r.createdAt,
      }))

      const firstDate = recordDates[0].date
      const now = new Date()

      const periods =
        input.period === "weekly"
          ? generateWeeklyPeriods(firstDate, now)
          : generateMonthlyPeriods(firstDate, now)

      const chartData = periods
        .map((period) => {
          const balance = findClosestRecord(recordDates, period)
          return {
            date: period.toISOString(),
            balance: balance ?? 0,
          }
        })
        .filter((item) => item.balance > 0)

      if (chartData.length === 0) {
        const latestRecord = recordDates[recordDates.length - 1]
        chartData.push({
          date: getMonthEndDate(latestRecord.date).toISOString(),
          balance: latestRecord.amount,
        })
      }

      return chartData
    }),

  getGlobalChartData: protectedProcedure
    .input(z.object({ period: periodSchema }))
    .query(async ({ ctx, input }) => {
      const wallets = await ctx.db.wallet.findMany({
        where: {
          userId: ctx.user!.id,
        },
        include: {
          records: {
            orderBy: [
              { date: "asc" },
              { createdAt: "asc" },
            ],
          },
        },
      })

      const allRecords = wallets.flatMap((wallet) =>
        wallet.records.map((r) => ({
          walletId: wallet.id,
          date: new Date(r.date),
          amount: Number(r.amount),
          createdAt: r.createdAt,
        }))
      )

      if (allRecords.length === 0) {
        return []
      }

      allRecords.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime()
        if (dateDiff !== 0) return dateDiff
        if (a.createdAt && b.createdAt) {
          return a.createdAt.getTime() - b.createdAt.getTime()
        }
        return 0
      })

      const firstDate = allRecords[0].date
      const now = new Date()

      const periods =
        input.period === "weekly"
          ? generateWeeklyPeriods(firstDate, now)
          : generateMonthlyPeriods(firstDate, now)

      const chartData = periods
        .map((period) => {
          const validRecords = allRecords.filter((r) => r.date <= period)

          if (validRecords.length === 0) {
            return null
          }

          validRecords.sort((a, b) => {
            const dateDiff = b.date.getTime() - a.date.getTime()
            if (dateDiff !== 0) return dateDiff
            if (a.createdAt && b.createdAt) {
              return b.createdAt.getTime() - a.createdAt.getTime()
            }
            return 0
          })

          const walletBalances = new Map<string, { date: Date; amount: number }>()
          for (const record of validRecords) {
            const existing = walletBalances.get(record.walletId)
            if (!existing || record.date.getTime() > existing.date.getTime()) {
              walletBalances.set(record.walletId, { date: record.date, amount: record.amount })
            }
          }

          const totalBalance = Array.from(walletBalances.values()).reduce(
            (sum, val) => sum + val.amount,
            0
          )

          return {
            date: period.toISOString(),
            balance: totalBalance,
          }
        })
        .filter((item): item is { date: string; balance: number } => item !== null && item.balance > 0)

      if (chartData.length === 0 && allRecords.length > 0) {
        const latestDate = allRecords[allRecords.length - 1].date
        const walletBalances = new Map<string, { date: Date; amount: number }>()
        for (const record of allRecords) {
          const existing = walletBalances.get(record.walletId)
          if (!existing || record.date.getTime() > existing.date.getTime()) {
            walletBalances.set(record.walletId, { date: record.date, amount: record.amount })
          }
        }
        const totalBalance = Array.from(walletBalances.values()).reduce(
          (sum, val) => sum + val.amount,
          0
        )

        chartData.push({
          date: getMonthEndDate(latestDate).toISOString(),
          balance: totalBalance,
        })
      }

      return chartData
    }),

  getWalletDistribution: protectedProcedure.query(async ({ ctx }) => {
    const wallets = await ctx.db.wallet.findMany({
      where: {
        userId: ctx.user!.id,
      },
      include: {
        category: true,
        records: {
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
    })

    const COLORS = [
      "#0ea5e9",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ]

    return wallets.map((wallet, index) => ({
      name: wallet.name,
      value: wallet.records[0]?.amount
        ? Number(wallet.records[0].amount)
        : 0,
      fill: COLORS[index % COLORS.length],
    }))
  }),
})
