import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { walletSchema } from "@/features/accounts/validation";
import { TRPCError } from "@trpc/server";
import { Bucket, MAX_FILE_SIZE_IMAGE } from "@/lib/supabase/bucket";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { encrypt, decrypt, deriveKey } from "@/lib/encryption";

async function uploadWalletImage(
  imageBase64: string,
  walletId: string
): Promise<string> {
  const tmp = new Date().getTime().toString();
  const buffer = Buffer.from(imageBase64, "base64");

  if (buffer.byteLength > MAX_FILE_SIZE_IMAGE) {
    throw new Error("Ukuran gambar tidak boleh lebih dari 2MB");
  }

  const fileName = `${walletId}.jpeg`;
  const supabaseAdmin = createSupabaseAdmin();

  const { data, error } = await supabaseAdmin.storage
    .from(Bucket.WALLET_ICONS)
    .upload(fileName, buffer, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(Bucket.WALLET_ICONS)
    .getPublicUrl(data.path);

  return `${urlData.publicUrl}?t=${tmp}`;
}

export const accountsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const key = deriveKey(ctx.user!.id).key

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
        _count: {
          select: { records: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      notes: wallet.notes ? decrypt(wallet.notes, key) : null,
      imageUrl: wallet.imageUrl,
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
        ? Number(decrypt(wallet.records[0].amount, key))
        : 0,
      _count: {
        records: wallet._count.records,
      },
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const key = deriveKey(ctx.user!.id).key

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
        notes: wallet.notes ? decrypt(wallet.notes, key) : null,
        imageUrl: wallet.imageUrl,
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
          amount: Number(decrypt(r.amount, key)),
          date: r.date.toISOString(),
          notes: r.notes ? decrypt(r.notes, key) : null,
          walletId: r.walletId,
          createdAt: r.createdAt.toISOString(),
        })),
        currentBalance: wallet.records[0]?.amount
          ? Number(decrypt(wallet.records[0].amount, key))
          : 0,
      };
    }),

  create: protectedProcedure
    .input(walletSchema)
    .mutation(async ({ ctx, input }) => {
      const key = deriveKey(ctx.user!.id).key

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

      const encryptedNotes = input.notes ? encrypt(input.notes, key) : null

      const wallet = await ctx.db.wallet.create({
        data: {
          name: input.name,
          categoryId: input.categoryId,
          notes: encryptedNotes,
          userId: ctx.user!.id,
        },
        include: {
          category: true,
        },
      });

      let imageUrl: string | undefined;
      if (input.image) {
        imageUrl = await uploadWalletImage(input.image, wallet.id);
        await ctx.db.wallet.update({
          where: { id: wallet.id },
          data: { imageUrl },
        });
      }

      return {
        id: wallet.id,
        name: wallet.name,
        notes: wallet.notes ? decrypt(wallet.notes, key) : null,
        imageUrl: imageUrl ?? null,
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
      const key = deriveKey(ctx.user!.id).key

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

      let imageUrl = existing.imageUrl;
      if (input.data.image) {
        imageUrl = await uploadWalletImage(input.data.image, input.id);
      }

      const updateData: {
        name?: string
        categoryId?: string
        notes?: string | null
        imageUrl?: string | null
      } = {}

      if (input.data.name !== undefined) {
        updateData.name = input.data.name
      }
      if (input.data.categoryId !== undefined) {
        updateData.categoryId = input.data.categoryId
      }
      if (input.data.notes !== undefined) {
        updateData.notes = input.data.notes ? encrypt(input.data.notes, key) : null
      }
      if (imageUrl !== existing.imageUrl) {
        updateData.imageUrl = imageUrl
      }

      const wallet = await ctx.db.wallet.update({
        where: {
          id: input.id,
        },
        data: updateData,
        include: {
          category: true,
        },
      });

      return {
        id: wallet.id,
        name: wallet.name,
        notes: wallet.notes ? decrypt(wallet.notes, key) : null,
        imageUrl: wallet.imageUrl,
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
