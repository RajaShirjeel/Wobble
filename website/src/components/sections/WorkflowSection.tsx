"use client";

import React, { useState } from "react";
import { Shuffle, Minimize2, Cpu, Wrench, ShieldCheck, ChevronRight } from "lucide-react";

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "hunt",
      stepNumber: "01",
      name: "Hunt",
      title: "Shuffle and measure failure probability",
      icon: Shuffle,
      summary:
        "Wobble executes your pytest suite across randomized seeds, tracking pass/fail outcomes to establish an empirical 95% Wilson confidence interval.",
      technicalDetail:
        "Distinguishes true flakiness from deterministic failure. A test is marked 'observed flaky' only after it both passes and fails across bounded permutations.",
      codeSnippet: `.venv/bin/wobble hunt tests/ \\
  --runs 20 --seed 0 --minimize \\
  --output reports/hunt.json`,
      metrics: "Wilson 95% Interval: [42.1%, 78.9%] • 20 Shuffled Seeds",
    },
    {
      id: "minimize",
      stepNumber: "02",
      name: "Minimize",
      title: "Isolate the 1-minimal polluter prefix",
      icon: Minimize2,
      summary:
        "When an order fails, Wobble replays the execution sequence using delta debugging (ddmin) to isolate the exact earlier polluter test causing the victim to break.",
      technicalDetail:
        "Reduces a 300-test execution order down to the exact 2-test causal pair (e.g., test_a_polluter -> test_b_victim). Eliminates guesswork from large suites.",
      codeSnippet: `Minimizer: Replaying prefix with victim last...
Eliminating partitions [0..149] -> Failure reproduces
Eliminating partitions [150..220] -> 1-minimal prefix isolated:
[test_a_polluter, test_b_victim]`,
      metrics: "Prefix Reduction: 142 tests -> 2 tests (100% reproducible)",
    },
    {
      id: "investigate",
      stepNumber: "03",
      name: "Investigate",
      title: "Local model with bounded actions",
      icon: Cpu,
      summary:
        "A local open-weight model (Qwen3 4B via Ollama) inspects minimal test code and failure logs, selecting bounded experiments to test causal hypotheses.",
      technicalDetail:
        "The model is restricted to a strict tool menu: run_isolated, run_before_victim, minimize_order, shift_clock (libfaketime), and finish. Unsupported claims are discarded.",
      codeSnippet: `Model Action: shift_clock (+3600s) -> Outcome: PASSED
Model Action: run_isolated(victim) -> Outcome: PASSED
Diagnosis: Shared module-level mutable cache in test_a`,
      metrics: "Bounded Experiment Loop: Max 5 actions • Zero Network Egress",
    },
    {
      id: "repair",
      stepNumber: "04",
      name: "Repair",
      title: "Generate targeted source insertion",
      icon: Wrench,
      summary:
        "Wobble requests a targeted fix (such as an autouse fixture with state cleanup or context teardown) and applies it strictly to an isolated temporary copy.",
      technicalDetail:
        "Does not touch your active working tree. The candidate patch is held in isolation until it survives empirical verification.",
      codeSnippet: `--- a/examples/order_dependent/test_state.py
+++ b/examples/order_dependent/test_state.py
@@ -3,3 +3,6 @@
+@pytest.fixture(autouse=True)
+def reset_cache():
+    GLOBAL_CACHE.clear()`,
      metrics: "Patch Scope: 4-line surgical fixture insertion",
    },
    {
      id: "verify",
      stepNumber: "05",
      name: "Verify",
      title: "Exhaustive perturbation validation",
      icon: ShieldCheck,
      summary:
        "The proposed patch is verified against the original reproducer, the full test suite, and 20 randomized seed perturbations in fresh processes.",
      technicalDetail:
        "Only when all perturbation runs pass 100% cleanly is reports/model-fix.diff written. If verification fails, the patch is rejected.",
      codeSnippet: `Verifying candidate patch...
[1/3] Reproducer order: PASSED (0.12s)
[2/3] Full suite order: PASSED (1.45s)
[3/3] 20 Randomized perturbation runs: 20/20 PASSED
Verification status: VERIFIED -> wrote reports/model-fix.diff`,
      metrics: "Verification Criteria: 20/20 Perturbations Green",
    },
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <section id="workflow" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>02 / THE FIVE-PHASE ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            How Wobble works: <br />
            Empirical science, not stochastic guesses.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            Every conclusion is backed by executed tests. The model can propose hypotheses,
            but only the runner and verifier decide what actually happened.
          </p>
        </div>

        {/* Step Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {steps.map((s, idx) => {
            const isSelected = activeStep === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-[#171A20] border-white/20 text-[#F2F1ED] shadow-lg"
                    : "bg-[#101216]/60 border-white/5 text-[#737780] hover:text-[#A4A6AC] hover:bg-[#101216]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#6B8CAE]">
                    {s.stepNumber}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#F2F1ED]" : "text-[#737780]"}`} />
                </div>
                <span className="text-xs font-semibold tracking-wide font-mono uppercase">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Phase Deep Dive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-xl bg-[#101216] border border-white/10 shadow-2xl">
          {/* Left: Phase Description & Architecture */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#171A20] border border-white/10 flex items-center justify-center text-[#F2F1ED]">
                  <StepIcon className="w-4 h-4 text-[#6B8CAE]" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#737780] uppercase tracking-wider block">
                    Phase {current.stepNumber}
                  </span>
                  <h3 className="text-xl font-bold text-[#F2F1ED] font-sans">
                    {current.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-[#A4A6AC] leading-relaxed mb-4">
                {current.summary}
              </p>

              <div className="p-3.5 rounded-lg bg-[#171A20] border border-white/10 text-xs text-[#A4A6AC] leading-relaxed mb-6">
                <span className="text-[#F2F1ED] font-semibold block mb-1 font-mono text-[11px] uppercase tracking-wide">
                  Technical Contract
                </span>
                {current.technicalDetail}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#737780]">
              <span>Validation Guarantee</span>
              <span className="text-[#6BB396] font-medium">{current.metrics}</span>
            </div>
          </div>

          {/* Right: Terminal & Trace Simulation */}
          <div className="lg:col-span-6 terminal-window p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#737780] mb-3">
              <span className="text-[#A4A6AC]">wobble-engine / {current.id}.sh</span>
              <span>exit: 0</span>
            </div>

            <pre className="text-xs font-mono text-[#C0C6D0] leading-relaxed overflow-x-auto whitespace-pre-wrap py-2">
              <code>{current.codeSnippet}</code>
            </pre>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#737780]">
              <span>Deterministic Assertion</span>
              <span className="text-[#6B8CAE]">wobble-engine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
