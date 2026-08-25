import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma as db } from "@/lib/prisma/db";
import { deriveKey, decrypt } from "@/lib/encryption";

const formatSchema = z.enum(["csv", "json"]);

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ format: string }> },
) {
  const parsed = formatSchema.safeParse((await params).format);
  if (!parsed.success) {
    return NextResponse.json({ error: "Format not found" }, { status: 404 });
  }
  const format = parsed.data;

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = deriveKey(user.id).key;

  const categories = await db.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const wallets = await db.wallet.findMany({
    where: { userId: user.id },
    include: {
      category: true,
      records: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  const date = new Date().toISOString().slice(0, 10);
  const filename = `yatra-export-${date}.${format}`;

  if (format === "json") {
    const body = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          isDefault: c.isDefault,
          createdAt: c.createdAt.toISOString(),
        })),
        wallets: wallets.map((w) => ({
          id: w.id,
          name: w.name,
          notes: w.notes ? decrypt(w.notes, key) : null,
          imageUrl: w.imageUrl,
          categoryId: w.categoryId,
          categoryName: w.category.name,
          createdAt: w.createdAt.toISOString(),
        })),
        records: wallets.flatMap((w) =>
          w.records.map((r) => ({
            id: r.id,
            walletId: r.walletId,
            walletName: w.name,
            amount: Number(decrypt(r.amount, key)),
            date: r.date.toISOString(),
            notes: r.notes ? decrypt(r.notes, key) : null,
            createdAt: r.createdAt.toISOString(),
          })),
        ),
      },
      null,
      2,
    );

    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const rows = [
    [
      "date",
      "wallet_name",
      "category_name",
      "category_type",
      "amount",
      "notes",
    ].join(","),
    ...wallets.flatMap((w) =>
      w.records.map((r) =>
        [
          csvEscape(r.date.toISOString()),
          csvEscape(w.name),
          csvEscape(w.category.name),
          csvEscape(w.category.type),
          Number(decrypt(r.amount, key)),
          r.notes ? csvEscape(decrypt(r.notes, key)) : "",
        ].join(","),
      ),
    ),
  ].join("\n");

  return new Response(rows + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
