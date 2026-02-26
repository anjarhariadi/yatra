import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { recordSchema, recordUpdateSchema } from '@/features/records/validation'
import { TRPCError } from '@trpc/server'

export const recordsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(recordSchema)
    .mutation(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findFirst({
        where: {
          id: input.walletId,
          userId: ctx.user!.id,
        },
      })

      if (!wallet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        })
      }

      const record = await ctx.db.record.create({
        data: {
          walletId: input.walletId,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes ?? null,
        },
      })

      return {
        id: record.id,
        amount: Number(record.amount),
        date: record.date.toISOString(),
        notes: record.notes,
        walletId: record.walletId,
        createdAt: record.createdAt.toISOString(),
      }
    }),

  getByWalletId: protectedProcedure
    .input(z.object({ walletId: z.string() }))
    .query(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findFirst({
        where: {
          id: input.walletId,
          userId: ctx.user!.id,
        },
      })

      if (!wallet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        })
      }

      const records = await ctx.db.record.findMany({
        where: {
          walletId: input.walletId,
        },
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      return records.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        date: r.date.toISOString(),
        notes: r.notes,
        walletId: r.walletId,
        createdAt: r.createdAt.toISOString(),
      }))
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: recordUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.record.findFirst({
        where: {
          id: input.id,
        },
        include: {
          wallet: true,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        })
      }

      if (existing.wallet.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this record',
        })
      }

      const updateData: {
        amount?: number
        date?: Date
        notes?: string | null
      } = {}

      if (input.data.amount !== undefined) {
        updateData.amount = input.data.amount
      }
      if (input.data.date !== undefined) {
        updateData.date = new Date(input.data.date)
      }
      if (input.data.notes !== undefined) {
        updateData.notes = input.data.notes ?? null
      }

      const record = await ctx.db.record.update({
        where: {
          id: input.id,
        },
        data: updateData,
      })

      return {
        id: record.id,
        amount: Number(record.amount),
        date: record.date.toISOString(),
        notes: record.notes,
        walletId: record.walletId,
        createdAt: record.createdAt.toISOString(),
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.record.findFirst({
        where: {
          id: input.id,
        },
        include: {
          wallet: true,
        },
      })

      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found',
        })
      }

      if (record.wallet.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this record',
        })
      }

      await ctx.db.record.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),
})
