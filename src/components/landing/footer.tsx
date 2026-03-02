import Link from "next/link";
import { Wallet2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Wallet2 className="h-5 w-5" />
              <span className="font-bold text-lg">Yatra</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Personal finance tracking for lazy people.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#cta" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
                Register
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Privacy
              </span>
              <span className="text-sm text-muted-foreground">
                Terms
              </span>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 Yatra. Personal finance tracking.
          </p>
        </div>
      </div>
    </footer>
  );
}
