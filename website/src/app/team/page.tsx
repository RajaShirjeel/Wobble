import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GitPullRequest, ArrowRight, Heart } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export const metadata: Metadata = {
  title: "Maintainers & Team — Wobble",
  description: "Meet the creator, maintainers, and open-source contributors behind the Wobble flaky-test investigation tool.",
};

export default function TeamPage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>PROJECT STEWARDSHIP</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Project maintainers &amp; <br />
          open-source contributors.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Wobble is developed and maintained by open-source software engineers dedicated
          to deterministic test infrastructure and empirical verification.
        </p>
      </div>

      {/* Maintainer Card */}
      <div className="mb-14 p-8 rounded-xl bg-[#101216] border border-white/10 max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#171A20] border border-white/10 flex items-center justify-center font-mono font-bold text-lg text-[#F2F1ED]">
              RS
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F2F1ED] font-sans">
                Raja Shirjeel
              </h2>
              <span className="text-xs font-mono text-[#6B8CAE]">
                Project Creator &amp; Core Maintainer
              </span>
            </div>
          </div>

          <a
            href="https://github.com/RajaShirjeel"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#171A20] border border-white/10 hover:border-white/20 text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors"
            aria-label="Raja Shirjeel GitHub profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          Architected Wobble to solve order-dependent flakiness in Python test suites.
          Maintains the core permutation runner, delta debugging minimization pipeline,
          and container isolation harnesses.
        </p>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#737780]">
          <span>Repository Owner: RajaShirjeel/Wobble</span>
          <a
            href="https://github.com/RajaShirjeel/Wobble"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B8CAE] hover:underline"
          >
            View GitHub Profile &rarr;
          </a>
        </div>
      </div>

      {/* Community Contributors Section */}
      <div className="p-8 rounded-xl bg-[#101216] border border-white/10 mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6BB396]">
            <Heart className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            Open-Source Community Contributors
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-6">
          Wobble thrives on community participation. Software engineers worldwide contribute
          reproducers for subtle order dependencies, improve libfaketime compatibility across platforms,
          and expand Ollama prompt templates.
        </p>

        <div className="p-5 rounded-lg bg-[#14161C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#F2F1ED] block mb-1 font-sans">
              Want to join the team of contributors?
            </span>
            <span className="text-xs text-[#737780]">
              We welcome documentation improvements, runner extensions, and test case fixtures.
            </span>
          </div>

          <Link
            href="/contribute"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-colors shrink-0"
          >
            <span>Contribution Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/about" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; About Wobble
        </Link>
        <Link href="/feedback" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Send Feedback &amp; Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
