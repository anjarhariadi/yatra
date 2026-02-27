import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  getMonthEndDate,
  generateWeeklyPeriods,
  generateMonthlyPeriods,
  findClosestRecord,
} from "@/lib/date-utils";

const periodSchema = z.enum(["weekly", "monthly"]);

export const chartsRouter = createTRPCRouter({
  getWalletChartData: protectedProcedure
    .input(
      z.object({
        walletId: z.string(),
        period: periodSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findFirst({
        where: {
          id: input.walletId,
          userId: ctx.user!.id,
        },
      });

      if (!wallet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      const records = await ctx.db.record.findMany({
        where: {
          walletId: input.walletId,
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      });

      if (records.length === 0) {
        return [];
      }

      const recordDates = records.map((r) => ({
        date: new Date(r.date),
        amount: Number(r.amount),
        createdAt: r.createdAt,
      }));

      const firstDate = recordDates[0].date;
      const now = new Date();

      const periods =
        input.period === "weekly"
          ? generateWeeklyPeriods(firstDate, now)
          : generateMonthlyPeriods(firstDate, now);

      const chartData = periods
        .map((period) => {
          const balance = findClosestRecord(recordDates, period);
          return {
            date: period.toISOString(),
            balance: balance ?? 0,
          };
        })
        .filter((item) => item.balance > 0);

      if (chartData.length === 0) {
        const latestRecord = recordDates[recordDates.length - 1];
        chartData.push({
          date: getMonthEndDate(latestRecord.date).toISOString(),
          balance: latestRecord.amount,
        });
      }

      return chartData;
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
            orderBy: [{ date: "asc" }, { createdAt: "asc" }],
          },
        },
      });

      const allRecords = wallets.flatMap((wallet) =>
        wallet.records.map((r) => ({
          walletId: wallet.id,
          date: new Date(r.date),
          amount: Number(r.amount),
          createdAt: r.createdAt,
        })),
      );

      if (allRecords.length === 0) {
        return [];
      }

      allRecords.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        if (a.createdAt && b.createdAt) {
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return 0;
      });

      const firstDate = allRecords[0].date;
      const now = new Date();

      const periods =
        input.period === "weekly"
          ? generateWeeklyPeriods(firstDate, now)
          : generateMonthlyPeriods(firstDate, now);

      const chartData = periods
        .map((period) => {
          const validRecords = allRecords.filter((r) => r.date <= period);

          if (validRecords.length === 0) {
            return null;
          }

          validRecords.sort((a, b) => {
            const dateDiff = b.date.getTime() - a.date.getTime();
            if (dateDiff !== 0) return dateDiff;
            if (a.createdAt && b.createdAt) {
              return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
          });

          const walletBalances = new Map<
            string,
            { date: Date; amount: number }
          >();
          for (const record of validRecords) {
            const existing = walletBalances.get(record.walletId);
            if (!existing || record.date.getTime() > existing.date.getTime()) {
              walletBalances.set(record.walletId, {
                date: record.date,
                amount: record.amount,
              });
            }
          }

          const totalBalance = Array.from(walletBalances.values()).reduce(
            (sum, val) => sum + val.amount,
            0,
          );

          return {
            date: period.toISOString(),
            balance: totalBalance,
          };
        })
        .filter(
          (item): item is { date: string; balance: number } =>
            item !== null && item.balance > 0,
        );

      if (chartData.length === 0 && allRecords.length > 0) {
        const latestDate = allRecords[allRecords.length - 1].date;
        const walletBalances = new Map<
          string,
          { date: Date; amount: number }
        >();
        for (const record of allRecords) {
          const existing = walletBalances.get(record.walletId);
          if (!existing || record.date.getTime() > existing.date.getTime()) {
            walletBalances.set(record.walletId, {
              date: record.date,
              amount: record.amount,
            });
          }
        }
        const totalBalance = Array.from(walletBalances.values()).reduce(
          (sum, val) => sum + val.amount,
          0,
        );

        chartData.push({
          date: getMonthEndDate(latestDate).toISOString(),
          balance: totalBalance,
        });
      }

      return chartData;
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
    });

    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    return wallets.map((wallet, index) => ({
      name: wallet.name,
      value: wallet.records[0]?.amount ? Number(wallet.records[0].amount) : 0,
      fill: colors[index % colors.length],
    }));
  }),
});
