"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertOctagon, Lock, EyeOff, Server, HardDrive, ArrowRight } from "lucide-react";

export default function SafetySection() {
  return (
    <section id="safety" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>04 / BOUNDARIES & SECURITY HYGIENE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            Local-first AI & honest safety.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            Software verification tools require explicit trust boundaries. Wobble runs
            open-weight models locally, confines tests in ephemeral containers, and never makes false security claims.
          </p>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-lg bg-[#101216] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE] mb-4">
                <EyeOff className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F2F1ED] mb-2 font-sans">
                Zero Cloud Egress
              </h3>
              <p className="text-xs text-[#A4A6AC] leading-relaxed">
                Investigative reasoning uses Ollama and open-weight models like Qwen3 4B. Your test suite code, internal fixtures, and failure logs never leave your workstation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-[#737780]">
              OLLAMA HOST: 127.0.0.1:11434
            </div>
          </div>

          <div className="p-6 rounded-lg bg-[#101216] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6BB396] mb-4">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F2F1ED] mb-2 font-sans">
                Disposable Containers
              </h3>
              <p className="text-xs text-[#A4A6AC] leading-relaxed">
                Docker runs mount your repository read-only, disable container network access, and isolate execution inside an ephemeral environment with strict CPU and memory caps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-[#737780]">
              FLAGS: --network none --read-only
            </div>
          </div>

          <div className="p-6 rounded-lg bg-[#101216] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-[#171A20] border border-white/10 flex items-center justify-center text-[#E5A962] mb-4">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F2F1ED] mb-2 font-sans">
                Isolated Patch Sandbox
              </h3>
              <p className="text-xs text-[#A4A6AC] leading-relaxed">
                Candidate patches are applied to disposable copies. Patches that delete test assertions are rejected, and changes are never written to your working tree unless verified.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-[#737780]">
              TARGET REPO: UNTOUCHED
            </div>
          </div>
        </div>

        {/* Clear Security Boundaries Callout Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#14161C] border border-white/10 flex flex-col md:flex-row items-start gap-6">
          <div className="w-10 h-10 rounded-lg bg-[#E06C75]/10 border border-[#E06C75]/30 flex items-center justify-center text-[#E06C75] shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-bold text-[#F2F1ED] font-sans">
              Explicit Engineering Limitations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A4A6AC] leading-relaxed">
              <div>
                <strong className="text-[#F2F1ED] block mb-1">Local runner is not a sandbox:</strong>
                Fresh local Python processes run with user privileges. Use the local runner only with code you already trust.
              </div>
              <div>
                <strong className="text-[#F2F1ED] block mb-1">Docker is not a hostile malware sandbox:</strong>
                Container isolation reduces risk, but it is not a defense against adversarial payloads targeting kernel vulnerabilities.
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/safety"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#6B8CAE] hover:text-[#F2F1ED] transition-colors"
              >
                <span>Read the complete safety specification &amp; threat model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
