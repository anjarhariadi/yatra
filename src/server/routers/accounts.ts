import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { walletSchema } from "@/features/accounts/validation";
import { TRPCError } from "@trpc/server";

export const accountsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
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
      orderBy: {
        name: "asc",
      },
    });

    return wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      notes: wallet.notes,
      userId: wallet.userId,
      categoryId: wallet.categoryId,
      category: {
        id: wallet.category.id,
        name: wallet.category.name,
        type: wallet.category.type,
        isDefault: wallet.category.isDefault,
        userId: wallet.category.userId,
        createdAt: wallet.category.createdAt.toISOString(),
        updatedAt: wallet.category.updatedAt.toISOString(),
      },
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
      currentBalance: wallet.records[0]?.amount
        ? Number(wallet.records[0].amount)
        : 0,
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
        include: {
          category: true,
          records: {
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          },
        },
      });

      if (!wallet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      return {
        id: wallet.id,
        name: wallet.name,
        notes: wallet.notes,
        userId: wallet.userId,
        categoryId: wallet.categoryId,
        category: {
          id: wallet.category.id,
          name: wallet.category.name,
          type: wallet.category.type,
          isDefault: wallet.category.isDefault,
          userId: wallet.category.userId,
          createdAt: wallet.category.createdAt.toISOString(),
          updatedAt: wallet.category.updatedAt.toISOString(),
        },
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
        records: wallet.records.map((r) => ({
          id: r.id,
          amount: Number(r.amount),
          date: r.date.toISOString(),
          notes: r.notes,
          walletId: r.walletId,
          createdAt: r.createdAt.toISOString(),
        })),
        currentBalance: wallet.records[0]?.amount
          ? Number(wallet.records[0].amount)
          : 0,
      };
    }),

  create: protectedProcedure
    .input(walletSchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          userId: ctx.user!.id,
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const wallet = await ctx.db.wallet.create({
        data: {
          name: input.name,
          categoryId: input.categoryId,
          notes: input.notes ?? null,
          userId: ctx.user!.id,
        },
        include: {
          category: true,
        },
      });

      return {
        id: wallet.id,
        name: wallet.name,
        notes: wallet.notes,
        userId: wallet.userId,
        categoryId: wallet.categoryId,
        category: {
          id: wallet.category.id,
          name: wallet.category.name,
          type: wallet.category.type,
          isDefault: wallet.category.isDefault,
          userId: wallet.category.userId,
          createdAt: wallet.category.createdAt.toISOString(),
          updatedAt: wallet.category.updatedAt.toISOString(),
        },
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: walletSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.wallet.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      if (input.data.categoryId) {
        const category = await ctx.db.category.findFirst({
          where: {
            id: input.data.categoryId,
            userId: ctx.user!.id,
          },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
      }

      const wallet = await ctx.db.wallet.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.data.name,
          categoryId: input.data.categoryId,
          notes: input.data.notes,
        },
        include: {
          category: true,
        },
      });

      return {
        id: wallet.id,
        name: wallet.name,
        notes: wallet.notes,
        userId: wallet.userId,
        categoryId: wallet.categoryId,
        category: {
          id: wallet.category.id,
          name: wallet.category.name,
          type: wallet.category.type,
          isDefault: wallet.category.isDefault,
          userId: wallet.category.userId,
          createdAt: wallet.category.createdAt.toISOString(),
          updatedAt: wallet.category.updatedAt.toISOString(),
        },
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.wallet.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      await ctx.db.wallet.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
