import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketPulse AI — Institutional Financial Intelligence & Probabilistic Outlook",
  description:
    "Apple-inspired financial intelligence terminal providing probabilistic market outlook, multi-timeframe confluence, order flow, liquidity analysis, and macroeconomic intelligence.",
  keywords: [
    "MarketPulse",
    "Financial Intelligence",
    "Market Outlook",
    "Forex Analysis",
    "Order Flow",
    "Liquidity Heatmap",
    "Multi-timeframe Confluence",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#08090B] text-[#F5F5F2] font-sans antialiased min-h-screen selection:bg-[#D4AF37]/25 selection:text-[#F5F5F2]">
        {children}
      </body>
    </html>
  );
}
