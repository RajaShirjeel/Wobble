"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Cpu, ShieldCheck, FileText } from "lucide-react";

export default function LeftNavRail() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Only track scroll sections when on homepage
    if (pathname !== "/") return;

    const sections = ["hero", "problem", "workflow", "evidence", "safety", "install"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const navItems = [
    { id: "hero", label: "Home", href: "/", icon: Home, matchSection: "hero" },
    { id: "features", label: "Features", href: "/features", icon: Layers, matchSection: "problem" },
    { id: "how-it-works", label: "How it works", href: "/how-it-works", icon: Cpu, matchSection: "workflow" },
    { id: "safety", label: "Safety", href: "/safety", icon: ShieldCheck, matchSection: "safety" },
    { id: "docs", label: "Docs", href: "/docs", icon: FileText, matchSection: "evidence" },
  ];

  return (
    <aside
      className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 p-1.5 rounded-full bg-[#101216]/70 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300"
      aria-label="Sidebar Navigation"
    >
      {navItems.map((item) => {
        const isCurrentPage = pathname === item.href;
        const isCurrentSection = pathname === "/" && activeSection === item.matchSection;
        const isActive = isCurrentPage || isCurrentSection;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 ${
              isActive
                ? "bg-white/[0.12] text-[#F2F1ED] shadow-sm"
                : "text-[#737780] hover:text-[#F2F1ED] hover:bg-white/[0.05]"
            }`}
            aria-label={item.label}
          >
            <Icon className="w-4 h-4" />

            {/* Hover Tooltip Pill */}
            <span className="absolute left-12 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#F2F1ED] bg-[#171A20] border border-white/10 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
              {item.label}
            </span>

            {/* Active Indicator Micro-Dot */}
            {isActive && (
              <span className="absolute -left-1 w-1 h-3 rounded-full bg-[#6B8CAE]" />
            )}
          </Link>
        );
      })}
    </aside>
  );
}
