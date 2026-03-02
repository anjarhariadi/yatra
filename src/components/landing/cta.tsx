import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="cta" className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Start Tracking Your{" "}
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                Finances Today
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              Join thousands who track their money the lazy way. No complex setup, no transaction tracking—just periodic balance updates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <Button size="lg" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
