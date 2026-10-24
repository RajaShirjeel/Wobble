"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Play, RefreshCw } from "lucide-react";

export default function ProblemSection() {
  const [activeScenario, setActiveScenario] = useState<"isolated" | "permuted">("permuted");

  return (
    <section id="problem" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>01 / THE MECHANICS OF FLAKINESS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            Why green suites fail in CI: <br />
            Shared state pollution.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            A test that passes in isolation is not guaranteed to pass in a suite.
            When an earlier test mutates a module-level variable, database fixture,
            or system environment without tearing it down, subsequent tests fail mysteriously.
          </p>
        </div>

        {/* Interactive Scenario Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveScenario("isolated")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-2 ${
              activeScenario === "isolated"
                ? "bg-[#171A20] text-[#6BB396] border border-[#6BB396]/40 shadow-lg"
                : "text-[#737780] hover:text-[#F2F1ED] border border-transparent"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Scenario A: Run in Isolation (Passing)</span>
          </button>

          <button
            onClick={() => setActiveScenario("permuted")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-2 ${
              activeScenario === "permuted"
                ? "bg-[#171A20] text-[#E06C75] border border-[#E06C75]/40 shadow-lg"
                : "text-[#737780] hover:text-[#F2F1ED] border border-transparent"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Scenario B: Shuffled Suite (Order-Dependent Failure)</span>
          </button>
        </div>

        {/* Code & State Flow Comparison Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Real Python Code Reproduction */}
          <div className="lg:col-span-7 terminal-window p-6 flex flex-col justify-between">
            <div>
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-xs font-mono text-[#737780]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="ml-2 text-[#A4A6AC]">examples/order_dependent/test_state.py</span>
                </div>
                <span>Python 3.11</span>
              </div>

              {/* Code Snippet with Line Explanations */}
              <pre className="text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto text-[#A4A6AC]">
                <code>
                  <span className="text-[#737780]"># Global shared registry or environment fixture</span>
                  {"\n"}
                  <span className="text-[#6B8CAE]">GLOBAL_CACHE</span> = {"{}"}
                  {"\n\n"}
                  <span className="text-[#737780]">{activeScenario === "permuted" ? ">>> TEST 1: THE POLLUTER (Mutates state without cleanup)" : "# (Skipped when running victim in isolation)"}</span>
                  {"\n"}
                  <span className="text-[#F2F1ED]">def</span> <span className="text-[#E5A962]">test_a_polluter</span>():
                  {"\n"}    <span className="text-[#6B8CAE]">GLOBAL_CACHE</span>[<span className="text-[#6BB396]">&quot;auth_override&quot;</span>] = <span className="text-[#F2F1ED]">True</span>
                  {"\n"}    <span className="text-[#F2F1ED]">assert</span> len(<span className="text-[#6B8CAE]">GLOBAL_CACHE</span>) == <span className="text-[#F2F1ED]">1</span>
                  {"\n\n"}
                  <span className="text-[#737780]">{"# TEST 2: THE VICTIM (Assumes pristine initial state)"}</span>
                  {"\n"}
                  <span className="text-[#F2F1ED]">def</span> <span className="text-[#E06C75]">test_b_victim</span>():
                  {"\n"}    <span className="text-[#737780]"># Fails if GLOBAL_CACHE was polluted by test_a</span>
                  {"\n"}    <span className="text-[#F2F1ED]">assert</span> <span className="text-[#6BB396]">&quot;auth_override&quot;</span> <span className="text-[#F2F1ED]">not in</span> <span className="text-[#6B8CAE]">GLOBAL_CACHE</span>
                </code>
              </pre>
            </div>

            {/* Diagnostic Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[#737780]">Order Dependency:</span>
              <span className={activeScenario === "permuted" ? "text-[#E06C75]" : "text-[#6BB396]"}>
                {activeScenario === "permuted" ? "test_a_polluter -> test_b_victim (FAILED)" : "test_b_victim alone (PASSED)"}
              </span>
            </div>
          </div>

          {/* Right: State Flow Diagnostics Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-lg bg-[#101216] border border-white/10">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#737780] mb-4">
                State Execution Trace
              </div>

              {activeScenario === "isolated" ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded bg-[#171A20] border border-white/10 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#A4A6AC] mb-1">
                      <span>1. Setup harness</span>
                      <span className="text-[#6BB396]">Fresh Memory</span>
                    </div>
                    <div className="text-[#737780]">GLOBAL_CACHE = &#123;&#125;</div>
                  </div>

                  <div className="p-3.5 rounded bg-[#171A20] border border-[#6BB396]/30 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#F2F1ED] mb-1">
                      <span>2. Execute test_b_victim</span>
                      <span className="text-[#6BB396] font-bold">PASSED</span>
                    </div>
                    <div className="text-[#737780]">Cache is empty. Assertion succeeds.</div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#6BB396]/10 border border-[#6BB396]/30 text-xs">
                    <span className="font-semibold text-[#6BB396] block mb-1">False Sense of Security:</span>
                    When run in a targeted test command, developers see 100% green and deploy with confidence.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded bg-[#171A20] border border-white/10 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#F2F1ED] mb-1">
                      <span>1. Execute test_a_polluter</span>
                      <span className="text-[#6BB396] font-bold">PASSED</span>
                    </div>
                    <div className="text-[#E5A962]">Mutates GLOBAL_CACHE without teardown fixture</div>
                  </div>

                  <div className="p-3.5 rounded bg-[#171A20] border border-[#E06C75]/40 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#F2F1ED] mb-1">
                      <span>2. Execute test_b_victim</span>
                      <span className="text-[#E06C75] font-bold">FAILED</span>
                    </div>
                    <div className="text-[#E06C75]">AssertionError: &quot;auth_override&quot; found in cache</div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#E06C75]/10 border border-[#E06C75]/30 text-xs">
                    <span className="font-semibold text-[#E06C75] block mb-1">The Flaky Nightmare:</span>
                    In a suite with 500 tests, this failure only triggers when test_a happens to run before test_b.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#737780] leading-relaxed">
              Wobble systematically isolates this polluter-victim pair using delta debugging (<code className="text-[#F2F1ED]">ddmin</code>) and computes an exact Wilson confidence interval.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
