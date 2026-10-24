import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, Shield, ArrowRight, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Wobble — Mission & Verification Philosophy",
  description: "Learn about Wobble's mission to eliminate flaky tests through algorithmic isolation, local open-weight intelligence, and statistical rigor.",
};

export default function AboutPage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>THE MISSION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Eliminating test flakiness <br />
          through empirical determinism.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Flaky tests drain engineering velocity, undermine confidence in continuous integration,
          and mask critical regression bugs. Wobble was built to treat test instability as a scientific debugging problem.
        </p>
      </div>

      {/* Core Principles */}
      <div className="space-y-8 mb-16">
        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <h2 className="text-xl font-bold text-[#F2F1ED] mb-3 font-sans">
            1. Execution is the Only Ground Truth
          </h2>
          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed">
            In modern software engineering, language models are frequently asked to hallucinate bug fixes without
            evaluating their effects. Wobble strictly adheres to empirical contracts: the model chooses structured
            experiments, but only the runner and verifier decide whether a bug reproduced or whether a candidate patch succeeded.
          </p>
        </div>

        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <h2 className="text-xl font-bold text-[#F2F1ED] mb-3 font-sans">
            2. Order Dependency is a Deterministic Bug
          </h2>
          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed">
            Engineers often label tests that pass on retry as &quot;random glitches.&quot; In reality, the overwhelming
            majority of intermittent test failures in Python originate from shared mutable state: mutated class attributes,
            unclosed file descriptors, leaked database transactions, or environmental race conditions. Every order-dependent
            failure has a concrete causal prefix.
          </p>
        </div>

        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <h2 className="text-xl font-bold text-[#F2F1ED] mb-3 font-sans">
            3. Local-First &amp; Zero Surveillance
          </h2>
          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed">
            Developer testing tools must never transmit proprietary test code, credentials, or environment secrets
            to third-party servers. Wobble runs completely on your local workstation or CI runner, leveraging
            Ollama and open-weight models with zero telemetry.
          </p>
        </div>
      </div>

      {/* Origin Card */}
      <div className="p-8 rounded-xl bg-[#14161C] border border-white/10 mb-16">
        <h2 className="text-base font-bold text-[#F2F1ED] mb-2 font-sans">
          Origin &amp; Open-Source Stewardship
        </h2>
        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          Wobble was created by <strong className="text-[#F2F1ED]">Raja Shirjeel</strong> as a response to the fragility
          of heuristic test retry suites in Python. It is licensed under the permissive MIT License to empower
          the global Python engineering community to achieve deterministic, trustworthy test pipelines.
        </p>
        <div className="text-xs font-mono text-[#6B8CAE]">
          GitHub Repository: <a href="https://github.com/RajaShirjeel/Wobble" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#F2F1ED]">github.com/RajaShirjeel/Wobble</a>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/download" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; Download CLI
        </Link>
        <Link href="/team" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Maintainers &amp; Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
