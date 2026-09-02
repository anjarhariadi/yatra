import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  getMonthEndDate,
  generateWeeklyPeriods,
  generateMonthlyPeriods,
  findClosestRecord,
} from "@/lib/date-utils";
import { decrypt, deriveKey } from "@/lib/encryption";

const periodSchema = z.enum(["weekly", "monthly"]);

interface DecryptedRecord {
  walletId: string;
  date: Date;
  amount: number;
  createdAt: Date;
}

function sumLatestPerWallet(
  records: DecryptedRecord[],
  cutoff?: Date,
): number {
  const walletBalances = new Map<string, { date: Date; amount: number }>();
  for (const record of records) {
    if (cutoff && record.date > cutoff) continue;
    const existing = walletBalances.get(record.walletId);
    if (!existing || record.date.getTime() > existing.date.getTime()) {
      walletBalances.set(record.walletId, {
        date: record.date,
        amount: record.amount,
      });
    }
  }
  return Array.from(walletBalances.values()).reduce(
    (sum, val) => sum + val.amount,
    0,
  );
}

function getLastMonthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0);
}

function compareToLastMonth(records: DecryptedRecord[]) {
  if (records.length === 0) {
    return { changePercent: null, direction: "flat" as const };
  }

  const currentTotal = sumLatestPerWallet(records);
  const prevMonthTotal = sumLatestPerWallet(records, getLastMonthEnd());

  if (prevMonthTotal === 0) {
    return { changePercent: null, direction: "flat" as const };
  }

  const changePercent =
    ((currentTotal - prevMonthTotal) / prevMonthTotal) * 100;

  const direction =
    changePercent === 0
      ? ("flat" as const)
      : changePercent > 0
        ? ("up" as const)
        : ("down" as const);

  return {
    changePercent: Math.round(changePercent * 10) / 10,
    direction,
  };
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

      const key = deriveKey(ctx.user!.id).key;

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
        amount: Number(decrypt(r.amount, key)),
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

  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const key = deriveKey(ctx.user!.id).key;

    const wallets = await ctx.db.wallet.findMany({
      where: {
        userId: ctx.user!.id,
      },
      include: {
        category: true,
        records: {
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const records: DecryptedRecord[] = wallets.flatMap((wallet) =>
      wallet.records.map((r) => ({
        walletId: wallet.id,
        date: new Date(r.date),
        amount: Number(decrypt(r.amount, key)),
        createdAt: r.createdAt,
      })),
    );

    const walletCount = wallets.length;
    const recordCount = records.length;

    const hotWalletIds = new Set(
      wallets
        .filter((w) => w.category.type === "HOT_CASH")
        .map((w) => w.id),
    );
    const hotRecords = records.filter((r) => hotWalletIds.has(r.walletId));

    const totalBalance = sumLatestPerWallet(records);
    const hotMoney = sumLatestPerWallet(hotRecords);

    const now = new Date();
    const firstDate = records[0]?.date ?? now;

    const weeklyPeriods = generateWeeklyPeriods(firstDate, now);
    const monthlyPeriods = generateMonthlyPeriods(firstDate, now);

    const buildGlobalChart = (periods: Date[]) => {
      const chartData = periods
        .map((period) => {
          const prevRecords = records.filter((r) => r.date <= period);
          if (prevRecords.length === 0) return null;
          return {
            date: period.toISOString(),
            balance: sumLatestPerWallet(prevRecords),
          };
        })
        .filter(
          (item): item is { date: string; balance: number } =>
            item !== null && item.balance > 0,
        );

      if (chartData.length === 0 && records.length > 0) {
        const latestDate = records[records.length - 1].date;
        chartData.push({
          date: getMonthEndDate(latestDate).toISOString(),
          balance: sumLatestPerWallet(records),
        });
      }
      return chartData;
    };

    const weeklyChartData = buildGlobalChart(weeklyPeriods);
    const monthlyChartData = buildGlobalChart(monthlyPeriods);

    const distribution = wallets.map((wallet, index) => {
      const latest = wallet.records[wallet.records.length - 1];
      return {
        name: wallet.name,
        value: latest ? Number(decrypt(latest.amount, key)) : 0,
        fill: COLORS[index % COLORS.length],
      };
    });

    return {
      wallets: wallets.map((wallet) => {
        const latest = wallet.records[wallet.records.length - 1];
        return {
          id: wallet.id,
          name: wallet.name,
          category: {
            id: wallet.category.id,
            name: wallet.category.name,
            type: wallet.category.type,
            color: wallet.category.color,
          },
          currentBalance: latest ? Number(decrypt(latest.amount, key)) : 0,
          recordCount: wallet.records.length,
        };
      }),
      totalBalance,
      hotMoney,
      walletCount,
      recordCount,
      comparison: compareToLastMonth(records),
      hotMoneyComparison: compareToLastMonth(hotRecords),
      weeklyChartData,
      monthlyChartData,
      distribution,
    };
  }),
});
