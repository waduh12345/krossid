import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans | Kross.id – Affiliate Platform",
  description:
    "Choose the right plan for your business: Starter, Business, Enterprise, or Free Trial. Transparent pricing for product owners and affiliates. Start free or scale with Kross.id.",
  keywords: [
    "pricing",
    "affiliate platform",
    "Kross.id",
    "starter",
    "business",
    "enterprise",
    "free trial",
    "plans",
  ],
  openGraph: {
    title: "Pricing | Kross.id",
    description: "Simple, transparent pricing. Starter, Business, Enterprise & Free Trial.",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
