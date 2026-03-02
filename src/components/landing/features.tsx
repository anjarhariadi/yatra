import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  Tags,
  FileText,
  BarChart3,
  Download,
  Shield,
} from "lucide-react";

const featureList = [
  "Multiple Wallets",
  "Smart Categories",
  "Balance Records",
  "Visual Insights",
  "Data Export",
  "Bank-Level Encryption",
];

const features = [
  {
    title: "Multiple Wallets",
    description:
      "Track cash, bank accounts, digital wallets, and more. Organize all your money in one place.",
    icon: Wallet,
  },
  {
    title: "Smart Categories",
    description:
      "Organize your money with Idle Cash, Hot Cash, and Emergency Fund categories.",
    icon: Tags,
  },
  {
    title: "Balance Records",
    description:
      "Simply add your current balance periodically. No need to track every transaction.",
    icon: FileText,
  },
  {
    title: "Visual Insights",
    description:
      "See your money distribution with pie charts and track trends with line charts.",
    icon: BarChart3,
  },
  {
    title: "Data Export",
    description:
      "Export your data to CSV or JSON anytime. Your data, your way.",
    icon: Download,
  },
  {
    title: "Bank-Level Encryption",
    description:
      "Your data is encrypted with AES-256 encryption. Only you can access your financial information.",
    icon: Shield,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="container mx-auto py-16 md:py-24 lg:py-32"
    >
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Everything you need to{" "}
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            track your money
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Simple features that make finance tracking effortless.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {featureList.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
          >
            {feature}
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="border-2 hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
