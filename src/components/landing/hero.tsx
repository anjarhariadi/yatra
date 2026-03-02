import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet2, TrendingUp, PieChart, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="container mx-auto py-16 md:py-24 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-transparent bg-clip-text">
              Money Tracking
            </span>{" "}
            for Lazy People
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
            Stop tracking every transaction. Just periodically record your balance and see where you stand. 
            Simple, effortless finance tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative z-10 grid gap-4">
            <div className="bg-background border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Total Balance</p>
                  <p className="text-2xl font-bold">Rp 15.500.000</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border rounded-xl p-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Hot Cash</p>
                <p className="text-lg font-semibold">Rp 5.000.000</p>
              </div>
              <div className="bg-background border rounded-xl p-4 shadow-lg">
                <PieChart className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Idle Cash</p>
                <p className="text-lg font-semibold">Rp 8.500.000</p>
              </div>
            </div>

            <div className="bg-background border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Fund</p>
                  <p className="text-lg font-semibold">Rp 2.000.000</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
}
