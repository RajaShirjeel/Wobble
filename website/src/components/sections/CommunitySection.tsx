"use client";

import React from "react";
import Link from "next/link";
import { GitPullRequest, Bug, MessageSquare, ArrowUpRight, Heart } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export default function CommunitySection() {
  const communityCards = [
    {
      title: "Inspect Source Code",
      desc: "Explore the complete core runner, ddmin minimizer, and Docker harnesses on GitHub.",
      href: "https://github.com/RajaShirjeel/Wobble",
      icon: GithubIcon,
      isExternal: true,
      action: "Star on GitHub",
    },
    {
      title: "Report Reproductions & Bugs",
      desc: "Encountered an order-dependent fixture or test permutation edge case? File an issue.",
      href: "https://github.com/RajaShirjeel/Wobble/issues",
      icon: Bug,
      isExternal: true,
      action: "Open Issue",
    },
    {
      title: "Contribute to Wobble",
      desc: "Help expand test runners, support additional frameworks, or enhance local agent prompts.",
      href: "/contribute",
      icon: GitPullRequest,
      isExternal: false,
      action: "Read Guidelines",
    },
    {
      title: "Community Discussions",
      desc: "Share flaky test war stories, time-travel testing insights, and architecture proposals.",
      href: "https://github.com/RajaShirjeel/Wobble/discussions",
      icon: MessageSquare,
      isExternal: true,
      action: "Join Discussion",
    },
  ];

  return (
    <section className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>06 / OPEN SOURCE ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            Built in the open. <br />
            Auditable down to the syscall.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            Wobble is created by Raja Shirjeel and maintained under the permissive MIT license.
            There are no proprietary diagnostic black boxes. Every line is inspectable and reproducible.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {communityCards.map((card) => {
            const Icon = card.icon;
            if (card.isExternal) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-lg bg-[#101216] border border-white/10 hover:border-white/20 transition-all duration-150 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-8 h-8 rounded-md bg-[#171A20] border border-white/10 flex items-center justify-center text-[#A4A6AC] group-hover:text-[#F2F1ED] group-hover:border-[#6B8CAE] transition-colors mb-4">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#F2F1ED] mb-2 font-sans">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#A4A6AC] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#6B8CAE] group-hover:text-[#F2F1ED]">
                    <span>{card.action}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </a>
              );
            }

            return (
              <Link
                key={card.title}
                href={card.href}
                className="p-6 rounded-lg bg-[#101216] border border-white/10 hover:border-white/20 transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-[#171A20] border border-white/10 flex items-center justify-center text-[#A4A6AC] group-hover:text-[#F2F1ED] group-hover:border-[#6B8CAE] transition-colors mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F2F1ED] mb-2 font-sans">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#A4A6AC] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#6B8CAE] group-hover:text-[#F2F1ED]">
                  <span>{card.action}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* License & Attribution Banner */}
        <div className="p-6 rounded-lg bg-[#14161C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#737780]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E06C75]" />
            <span>Open source under the MIT License. No tracking, telemetry, or analytics.</span>
          </div>
          <a
            href="https://github.com/RajaShirjeel/Wobble/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors underline underline-offset-4"
          >
            Read License
          </a>
        </div>
      </div>
    </section>
  );
}
