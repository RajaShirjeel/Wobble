"use client";

import React from "react";
import Link from "next/link";
import { MessageSquareCode, MessageSquareHeart } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export default function RightSocialRail() {
  const items = [
    {
      label: "GitHub Repo",
      href: "https://github.com/RajaShirjeel/Wobble",
      icon: GithubIcon,
      isExternal: true,
    },
    {
      label: "Discussions",
      href: "https://github.com/RajaShirjeel/Wobble/discussions",
      icon: MessageSquareCode,
      isExternal: true,
    },
    {
      label: "Send Feedback",
      href: "/feedback",
      icon: MessageSquareHeart,
      isExternal: false,
    },
  ];

  return (
    <aside
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 p-1.5 rounded-full bg-[#101216]/70 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300"
      aria-label="Community & Feedback Links"
    >
      {items.map((item) => {
        const Icon = item.icon;

        if (item.isExternal) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-9 h-9 rounded-full text-[#737780] hover:text-[#F2F1ED] hover:bg-white/[0.05] transition-all duration-150"
              aria-label={item.label}
            >
              <Icon className="w-4 h-4" />
              {/* Hover Tooltip Pill */}
              <span className="absolute right-12 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#F2F1ED] bg-[#171A20] border border-white/10 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
                {item.label}
              </span>
            </a>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className="group relative flex items-center justify-center w-9 h-9 rounded-full text-[#737780] hover:text-[#F2F1ED] hover:bg-white/[0.05] transition-all duration-150"
            aria-label={item.label}
          >
            <Icon className="w-4 h-4" />
            <span className="absolute right-12 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#F2F1ED] bg-[#171A20] border border-white/10 rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Subtle Divider & Version Indicator */}
      <div className="w-4 h-px bg-white/10 my-1" />
      <div className="text-[9px] font-mono text-[#737780] transform -rotate-90 py-2 select-none">
        OSS
      </div>
    </aside>
  );
}
