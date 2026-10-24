import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, EyeOff, Lock, AlertTriangle, ArrowRight, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Safety & Security Specification — Wobble",
  description: "Comprehensive trust boundaries, isolation guarantees, data exposure policies, and explicit limitations for Wobble.",
};

export default function SafetyPage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>TRUST MODEL &amp; SECURITY GUARANTEES</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Safety boundaries &amp; <br />
          known engineering limitations.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Developer tools require absolute honesty regarding their execution model.
          Here is how Wobble isolates test runs, manages patches, ensures zero data egress, and where its security boundaries end.
        </p>
      </div>

      {/* Explicit Disclaimer Alert Box */}
      <div className="p-6 rounded-xl bg-[#E06C75]/10 border border-[#E06C75]/30 mb-14 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-[#E06C75] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#F2F1ED] font-sans">
            Explicit Security Notice
          </h2>
          <p className="text-xs text-[#A4A6AC] leading-relaxed">
            Wobble is designed for hunting test flakiness in trusted or internal codebases.
            Neither fresh local processes nor standard Docker containers provide a defense against intentional,
            malicious hostile code targeting kernel exploits or container breakouts.
          </p>
        </div>
      </div>

      {/* 4 In-Depth Sections */}
      <div className="space-y-12 mb-20">
        {/* 1. Execution Runners */}
        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
              1. Local vs. Container Runner Boundaries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#A4A6AC] leading-relaxed">
            <div className="p-4 rounded-lg bg-[#171A20] border border-white/10 space-y-2">
              <span className="text-[#F2F1ED] font-mono font-bold block text-sm">
                Local Process Runner
              </span>
              <p>
                Spawns Python sub-processes directly on the host using <code className="text-[#6B8CAE]">subprocess</code>.
                State is clean between runs because each test permutation executes in a fresh interpreter instance,
                but the process has the exact permissions of the executing user.
              </p>
              <div className="text-[#E5A962] font-mono text-[11px] pt-2">
                &bull; Use only with trusted test suites.
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#171A20] border border-white/10 space-y-2">
              <span className="text-[#F2F1ED] font-mono font-bold block text-sm">
                Docker Runner (<code className="text-[#6BB396]">--runner docker</code>)
              </span>
              <p>
                Launches an ephemeral container (<code className="text-[#6BB396]">wobble-pytest:py311</code>) for each experiment.
                Target directories are mounted read-only (<code className="text-[#6BB396]">:ro</code>), network access is disabled
                (<code className="text-[#6BB396]">--network none</code>), and containers are purged on completion or timeout.
              </p>
              <div className="text-[#6BB396] font-mono text-[11px] pt-2">
                &bull; Limits filesystem corruption and network leakage.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Zero Data Egress */}
        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6BB396]">
              <EyeOff className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
              2. Data Privacy &amp; Local Model Telemetry
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-4">
            Wobble is local-first by architectural mandate. When using the AI-assisted investigation agent:
          </p>

          <ul className="space-y-2 text-xs text-[#A4A6AC] mb-6">
            <li className="flex items-center gap-2">
              <span className="text-[#6BB396]">&bull;</span>
              <span>All inferences are routed to a local Ollama instance (<code className="text-[#F2F1ED]">127.0.0.1:11434</code>).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#6BB396]">&bull;</span>
              <span>No proprietary API keys (OpenAI, Anthropic, or external proxies) are requested or required.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#6BB396]">&bull;</span>
              <span>No usage telemetry, tracking beacons, error monitoring, or analytics are compiled into the binary.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#6BB396]">&bull;</span>
              <span>Generated evidence reports remain strictly on your local disk in <code className="text-[#F2F1ED]">reports/</code>.</span>
            </li>
          </ul>

          <div className="terminal-window p-3 text-xs font-mono text-[#737780]">
            Network egress check: 0 bytes outbound outside loopback.
          </div>
        </div>

        {/* 3. Patch Sandboxing */}
        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#E5A962]">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
              3. Patch Sandboxing &amp; Anti-Tampering Rules
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-4">
            When Wobble proposes a repair patch, it enforces strict safety invariants before outputting a diff:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
              <span className="text-[#E06C75] font-bold block mb-1">Assertion Guard</span>
              Patches that remove assertions or skip test functions are rejected immediately.
            </div>
            <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
              <span className="text-[#E5A962] font-bold block mb-1">Disposable Tree</span>
              Verification occurs in a temporary clone. Your git working tree is untouched.
            </div>
            <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
              <span className="text-[#6BB396] font-bold block mb-1">Perturbation Gate</span>
              The patch must pass the original reproducer, full suite, and 20 randomized seeds.
            </div>
          </div>
        </div>

        {/* 4. Time Travel Limitations */}
        <div className="p-8 rounded-xl bg-[#101216] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
              4. Time Shifting (libfaketime) Limitations
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-4">
            Wobble supports shifting the system clock (<code className="text-[#6B8CAE]">--clock-shift-seconds</code>)
            via <code className="text-[#F2F1ED]">libfaketime</code> inside container runners.
            However, developers must understand its boundaries:
          </p>

          <div className="space-y-3 text-xs text-[#A4A6AC]">
            <p>
              <strong className="text-[#F2F1ED]">Wall clock vs Monotonic:</strong> The offset modifies
              wall clock readings (<code className="text-[#6B8CAE]">time.time()</code>, <code className="text-[#6B8CAE]">datetime.now()</code>).
              Monotonic timers (<code className="text-[#6B8CAE]">time.monotonic()</code>) remain unchanged to keep execution benchmarks accurate.
            </p>
            <p>
              <strong className="text-[#F2F1ED]">Bypass in native extensions:</strong> Programs that invoke
              direct kernel assembly syscalls (e.g. bypassing glibc wrappers) will not observe the fake time offset.
              Confirm time-sensitive flakiness with a targeted unit test before assuming full coverage.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/how-it-works" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; How It Works
        </Link>
        <Link href="/download" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Download &amp; Installation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
