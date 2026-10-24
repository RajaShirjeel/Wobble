import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, Shuffle, Minimize2, Shield, ArrowRight, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "How Wobble Works — Algorithmic & Statistical Architecture",
  description: "Examine the mathematical theory of order-dependent permutation testing, Wilson score intervals, and delta debugging test minimization.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>THE ALGORITHMIC ENGINE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          How Wobble works: <br />
          Mathematical and architectural depth.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Flaky test debugging is often treated as folklore and trial-and-error. Wobble formulates
          flakiness as an empirical optimization problem: order search, prefix reduction, and hypothesis verification.
        </p>
      </div>

      {/* Part 1: Permutation Space */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
            <Shuffle className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            1. The Permutation Space ($N!$)
          </h2>
        </div>
        <p className="text-sm text-[#A4A6AC] leading-relaxed mb-6">
          A test suite of size $N$ has $N!$ possible execution permutations. Under traditional alphabetical execution,
          only a single order is ever exercised in CI. State pollutants—such as mutated singletons, unclosed database
          connections, leaked mock patches, or file system artifacts—lie dormant until an arbitrary file renaming
          or worker parallelization reorders the tests.
        </p>
        <div className="terminal-window p-4 text-xs font-mono text-[#C0C6D0]">
          <code>
            Seed 0:  [test_user, test_auth, test_billing] -&gt; ALL PASSED <br />
            Seed 1:  [test_billing, test_user, test_auth] -&gt; ALL PASSED <br />
            Seed 42: [test_auth, test_billing, test_user] -&gt; test_billing FAILED!
          </code>
        </div>
      </div>

      {/* Part 2: Wilson Confidence Interval */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6BB396]">
            <Code2 className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            2. The 95% Wilson Score Interval
          </h2>
        </div>
        <p className="text-sm text-[#A4A6AC] leading-relaxed mb-6">
          Standard confidence intervals assume a normal distribution, which produces severe errors when sample sizes
          are small ($N \le 30$) or when failure probabilities are near 0 or 1. Wobble calculates the asymmetric
          Wilson score interval:
        </p>

        <div className="p-4 rounded-lg bg-[#171A20] border border-white/10 font-mono text-xs sm:text-sm text-[#F2F1ED] mb-6 text-center overflow-x-auto">
          CI = (p̂ + z²/2n ± z √[ p̂(1-p̂)/n + z²/4n² ]) / (1 + z²/n)
        </div>

        <p className="text-xs text-[#737780] leading-relaxed">
          Where $n$ is total runs, $p̂$ is the observed failure proportion, and $z = 1.95996$ for a 95% confidence level.
          This guarantees that reporting 3 failures in 20 runs yields a realistic certainty interval of [5.4%, 36.3%] rather than a naive 15%.
        </p>
      </div>

      {/* Part 3: Delta Debugging (ddmin) */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#E5A962]">
            <Minimize2 className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            3. Delta Debugging (ddmin) Prefix Minimization
          </h2>
        </div>
        <p className="text-sm text-[#A4A6AC] leading-relaxed mb-6">
          When an execution order containing 200 tests produces a failure in <code className="text-[#F2F1ED]">test_victim</code>,
          the failure is caused by a polluter earlier in that sequence. Wobble applies Andreas Zeller&apos;s delta debugging algorithm:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10 text-xs font-mono">
            <span className="text-[#6B8CAE] font-bold">Step 1: Partitioning.</span> Split earlier tests into $k$ subsets ($k=2, 4, 8\dots$).
          </div>
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10 text-xs font-mono">
            <span className="text-[#6B8CAE] font-bold">Step 2: Complement Testing.</span> Test $c \setminus c_i$ followed immediately by the victim.
          </div>
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10 text-xs font-mono">
            <span className="text-[#6B8CAE] font-bold">Step 3: Convergence.</span> If removing subset $c_i$ still fails, subset $c_i$ is discarded. Repeat until 1-minimal.
          </div>
        </div>

        <div className="terminal-window p-4 text-xs font-mono text-[#C0C6D0]">
          <code>
            [ddmin] Starting with 142 preceding tests... <br />
            [ddmin] Subsets k=2: Tested [0..71] + victim -&gt; PASSED <br />
            [ddmin] Tested [72..141] + victim -&gt; FAILED (isolated to 70 tests) <br />
            [ddmin] ... bisecting ... <br />
            [ddmin] Found 1-minimal reproducing prefix: [test_a_polluter, test_b_victim]
          </code>
        </div>
      </div>

      {/* Part 4: Local Model Coordination */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            4. Local Model Bounded Action Architecture
          </h2>
        </div>
        <p className="text-sm text-[#A4A6AC] leading-relaxed mb-6">
          Wobble never asks an LLM to guess a solution in a single prompt. Instead, the local model acts as an
          experimenter interacting with the test runner through a constrained schema:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-6">
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
            <span className="text-[#6BB396] font-bold block mb-1">run_isolated(test)</span>
            Verify if victim passes alone in fresh process
          </div>
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
            <span className="text-[#6BB396] font-bold block mb-1">run_before_victim(candidate)</span>
            Test suspected polluter directly before victim
          </div>
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
            <span className="text-[#6BB396] font-bold block mb-1">shift_clock(seconds)</span>
            Simulate wall clock offset using libfaketime
          </div>
          <div className="p-3.5 rounded bg-[#171A20] border border-white/10">
            <span className="text-[#6BB396] font-bold block mb-1">propose_patch(diff)</span>
            Propose targeted fixture or context manager patch
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#6B8CAE]/10 border border-[#6B8CAE]/30 text-xs text-[#A4A6AC] leading-relaxed">
          <strong className="text-[#F2F1ED] block mb-1 font-mono text-[11px] uppercase tracking-wider">
            Verification Gate:
          </strong>
          The coordinator runs the proposed patch in a disposable directory. If the original reproducer or any
          of the 20 randomized validation runs fail, the patch is rejected.
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/features" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; Engine Features
        </Link>
        <Link href="/safety" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Safety &amp; Isolation Model</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
