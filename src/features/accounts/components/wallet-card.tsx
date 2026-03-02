import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface WalletCardProps {
  wallet: {
    id: string;
    name: string;
    notes: string | null;
    imageUrl: string | null;
    category: { name: string };
    currentBalance?: number;
  };
}

export function WalletCard({ wallet }: WalletCardProps) {
  const balance = wallet.currentBalance ?? 0;

  return (
    <Link href={`/dashboard/accounts/${wallet.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {wallet.imageUrl ? (
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image
                    src={wallet.imageUrl}
                    alt={wallet.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-muted-foreground font-bold">
                  {wallet.name.charAt(0).toUpperCase()}
                </div>
              )}
              <CardTitle className="text-lg">{wallet.name}</CardTitle>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {wallet.category.name}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
          <p className="text-sm text-muted-foreground">Current balance</p>
          {wallet.notes && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {wallet.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
