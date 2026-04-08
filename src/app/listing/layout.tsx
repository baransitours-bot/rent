import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دارك - سوق العقارات | Darak Property Marketplace",
  description: "اكتشف العقارات المتاحة للإيجار في سوق دارك. شقق، منازل، محلات تجارية والمزيد. | Browse available rental properties on Darak marketplace.",
  openGraph: {
    title: "دارك - سوق العقارات | Darak Property Marketplace",
    description: "اكتشف العقارات المتاحة للإيجار في سوق دارك. | Browse available rental properties on Darak marketplace.",
    type: "website",
    siteName: "دارك | Darak",
  },
  twitter: {
    card: "summary_large_image",
    title: "دارك - سوق العقارات | Darak Property Marketplace",
    description: "اكتشف العقارات المتاحة للإيجار في سوق دارك.",
  },
};

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
