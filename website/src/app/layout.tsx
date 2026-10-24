import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";

export const metadata: Metadata = {
  title: "Wobble — Order-Dependent Pytest Flakiness Investigation",
  description:
    "Wobble stress-tests your Python suite in isolated environments, finds the conditions behind order-dependent failures, and verifies targeted fixes through randomized reruns.",
  keywords: [
    "pytest",
    "flaky tests",
    "order-dependent failures",
    "python testing",
    "test minimization",
    "ddmin",
    "software verification",
  ],
  authors: [{ name: "Raja Shirjeel" }],
  openGraph: {
    title: "Wobble — Deterministic Flaky Test Investigation",
    description:
      "Find and repair order-dependent test failures with local open-weight models, container isolation, and empirical patch verification.",
    type: "website",
    url: "https://github.com/RajaShirjeel/Wobble",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090A0C] text-[#F2F1ED] antialiased">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
