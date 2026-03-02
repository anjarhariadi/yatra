import { Navbar, Hero, Features, Cta, Footer } from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
