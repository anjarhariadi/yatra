import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { categorySchema } from '@/features/categories/validation'
import { TRPCError } from '@trpc/server'

export const categoriesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      where: {
        userId: ctx.user!.id,
      },
      include: {
        _count: {
          select: {
            wallets: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    })

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      isDefault: category.isDefault,
      userId: category.userId,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      _count: {
        wallets: category._count.wallets,
      },
    }))
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
        include: {
          _count: {
            select: {
              wallets: true,
            },
          },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      return {
        id: category.id,
        name: category.name,
        type: category.type,
        isDefault: category.isDefault,
        userId: category.userId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        _count: {
          wallets: category._count.wallets,
        },
      }
    }),

  create: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.category.findFirst({
        where: {
          name: input.name,
          userId: ctx.user!.id,
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Category with this name already exists',
        })
      }

      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          type: input.type,
          userId: ctx.user!.id,
          isDefault: false,
        },
      })

      return {
        id: category.id,
        name: category.name,
        type: category.type,
        isDefault: category.isDefault,
        userId: category.userId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: categorySchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      if (existing.isDefault) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify default category',
        })
      }

      if (input.data.name && input.data.name !== existing.name) {
        const duplicate = await ctx.db.category.findFirst({
          where: {
            name: input.data.name,
            userId: ctx.user!.id,
            NOT: {
              id: input.id,
            },
          },
        })

        if (duplicate) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category with this name already exists',
          })
        }
      }

      const category = await ctx.db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.data.name,
          type: input.data.type,
        },
      })

      return {
        id: category.id,
        name: category.name,
        type: category.type,
        isDefault: category.isDefault,
        userId: category.userId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.user!.id,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      if (existing.isDefault) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete default category',
        })
      }

      const walletCount = await ctx.db.wallet.count({
        where: {
          categoryId: input.id,
        },
      })

      if (walletCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete category with associated wallets',
        })
      }

      await ctx.db.category.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),
})
