import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletNotesCardProps {
  wallet: {
    notes: string | null;
  };
}

export function WalletNotesCard({ wallet }: WalletNotesCardProps) {
  if (!wallet.notes) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{wallet.notes}</p>
      </CardContent>
    </Card>
  );
}
