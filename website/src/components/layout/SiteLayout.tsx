"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import LeftNavRail from "@/components/navigation/LeftNavRail";
import RightSocialRail from "@/components/navigation/RightSocialRail";
import Footer from "@/components/navigation/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#090A0C] text-[#F2F1ED] flex flex-col relative selection:bg-[#6B8CAE]/30 selection:text-white">
        {/* Floating Oval Top Navbar */}
        <Navbar />

        {/* Floating Left Navigation Dock */}
        <LeftNavRail />

        {/* Floating Right Social & Feedback Rail */}
        <RightSocialRail />

        {/* Main Viewport Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Site Footer */}
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
