import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  Shuffle, 
  Minimize2, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Check, 
  X, 
  ArrowRight,
  Terminal
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features — Wobble Technical Specification",
  description: "Examine Wobble's technical capabilities: order permutation, ddmin minimization, Wilson score confidence intervals, container sandboxing, and local model reasoning.",
};

export default function FeaturesPage() {
  const capabilities = [
    {
      id: "permutation",
      title: "Shuffled Order Permutation Testing",
      badge: "Core Hunter",
      icon: Shuffle,
      description:
        "Standard test suites run alphabetically or by file order, hiding state pollution. Wobble systematically executes test suites across pseudorandom seeds, recording every execution sequence and test outcome.",
      details: [
        "Full seed provenance recorded in JSON evidence",
        "Configurable repetition budgets (--runs N)",
        "Selective test execution (--select pattern)",
        "Zero state retention between independent runs",
      ],
      terminalSnippet: `.venv/bin/wobble hunt tests/ --runs 25 --seed 42`,
    },
    {
      id: "statistics",
      title: "Wilson Score Confidence Intervals",
      badge: "Statistical Rigor",
      icon: Layers,
      description:
        "Rather than stating a test is simply 'flaky', Wobble computes a 95% Wilson score interval for binomial proportions. This accounts for small sample sizes and provides empirical bounds on failure likelihood.",
      details: [
        "Accounts for small sample sizes without normal approximation flaws",
        "Reports explicit observed pass/failure fractions (e.g. 14/20)",
        "Calculates lower and upper bound flakiness probabilities",
        "Only flags 'observed flaky' when a test exhibits both pass and fail",
      ],
      terminalSnippet: `Flakiness: 70.0% • Wilson 95% CI: [48.1%, 85.5%]`,
    },
    {
      id: "minimization",
      title: "Delta Debugging (ddmin) Prefix Minimization",
      badge: "Algorithmic Reduction",
      icon: Minimize2,
      description:
        "A failure that occurs after 200 tests is painful to debug manually. Wobble executes Zeller's delta debugging algorithm to systematically bisect and eliminate non-causal tests, isolating the minimal polluter.",
      details: [
        "Iterative partition bisection and complement testing",
        "Guarantees a 1-minimal failing prefix",
        "Detects multi-test polluter chains if present",
        "Requires repeated confirmation before marking reduced pairs",
      ],
      terminalSnippet: `Minimizer: Partition [0..149] eliminated. Minimal pair: [test_a, test_b]`,
    },
    {
      id: "container",
      title: "Disposable Docker Runner & Resource Caps",
      badge: "Isolation Boundary",
      icon: ShieldCheck,
      description:
        "Execute test hunts inside disposable Docker containers with enforced memory, CPU, and execution timeout constraints. Mounts your target repository read-only with network egress disabled.",
      details: [
        "Read-only target source mounts (--read-only)",
        "Disabled network access (--network none)",
        "Configurable CPU quotas (--cpus 0.5) and memory caps (--memory-mb 256)",
        "Ephemeral container destroyed immediately after test run",
      ],
      terminalSnippet: `.venv/bin/wobble hunt tests/ --runner docker --cpus 0.5 --memory-mb 256`,
    },
    {
      id: "timetravel",
      title: "Clock Shift & Time-Travel Simulation",
      badge: "Environment Perturbation",
      icon: Clock,
      description:
        "Flakiness often stems from timezone bugs, leap seconds, or month-boundary calculations. Wobble leverages libfaketime inside the container runner to shift system wall clocks without touching hardware time.",
      details: [
        "Shifts wall clock readings deterministically (--clock-shift-seconds)",
        "Leaves monotonic timers intact for accurate profiling",
        "Records timestamp shifts in each run's evidence ledger",
        "Enables automated verification of daylight savings edge cases",
      ],
      terminalSnippet: `.venv/bin/wobble hunt tests/ --runner docker --clock-shift-seconds 3600`,
    },
    {
      id: "agent",
      title: "Bounded Local Model Investigation & Repair",
      badge: "Local-First AI",
      icon: Cpu,
      description:
        "Integrates with local open-weight models (Qwen3 4B via Ollama) to interpret failure traces. The model is constrained to structured investigative actions and all proposed patches are strictly verified.",
      details: [
        "Bounded menu: run_isolated, run_before_victim, minimize_order, shift_clock",
        "Zero code egress to third-party cloud APIs",
        "Candidate patches verified in isolated temporary copies",
        "Patches that delete tests or assertions are rejected automatically",
      ],
      terminalSnippet: `.venv/bin/wobble repair tests/ --model qwen3:4b-instruct --patch-output fix.diff`,
    },
  ];

  const comparison = [
    {
      feature: "Randomized test execution order",
      wobble: true,
      pytestRandomly: true,
      pytestRerun: false,
    },
    {
      feature: "Delta debugging (ddmin) prefix minimization",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
    {
      feature: "95% Wilson confidence score interval",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
    {
      feature: "Disposable Docker container sandbox",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
    {
      feature: "System wall clock shift (libfaketime)",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
    {
      feature: "Local model-assisted causal analysis",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
    {
      feature: "Automated patch verification in disposable copy",
      wobble: true,
      pytestRandomly: false,
      pytestRerun: false,
    },
  ];

  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>TECHNICAL SPECIFICATION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Engine capabilities &amp; <br />
          verification architecture.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Wobble replaces heuristic test retries with algorithmic isolation. Every feature is
          designed to turn elusive order-dependent failures into reproducible, minimal causal pairs.
        </p>
      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.id}
              className="p-7 rounded-xl bg-[#101216] border border-white/10 hover:border-white/20 transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[#A4A6AC]">
                    {cap.badge}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#F2F1ED] mb-3 font-sans">
                  {cap.title}
                </h2>

                <p className="text-xs text-[#A4A6AC] leading-relaxed mb-6">
                  {cap.description}
                </p>

                <div className="space-y-2 mb-6">
                  {cap.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#737780]">
                      <span className="text-[#6B8CAE] mt-0.5">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 terminal-window p-3 text-[11px] font-mono text-[#C0C6D0] overflow-x-auto">
                <code>{cap.terminalSnippet}</code>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix */}
      <div className="mb-20">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-bold text-[#F2F1ED] mb-2 font-sans">
            How Wobble compares to retry plugins
          </h2>
          <p className="text-xs text-[#A4A6AC]">
            Simple retries hide flaky tests and increase CI latency. Wobble isolates root causes.
          </p>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-xl bg-[#101216]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#14161C] text-[#A4A6AC]">
                <th className="p-4 font-medium">Capability</th>
                <th className="p-4 font-medium text-[#F2F1ED]">Wobble</th>
                <th className="p-4 font-medium">pytest-randomly</th>
                <th className="p-4 font-medium">pytest-rerunfailures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#A4A6AC]">
              {comparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-[#F2F1ED]">{row.feature}</td>
                  <td className="p-4">
                    {row.wobble ? (
                      <Check className="w-4 h-4 text-[#6BB396]" />
                    ) : (
                      <X className="w-4 h-4 text-[#737780]" />
                    )}
                  </td>
                  <td className="p-4">
                    {row.pytestRandomly ? (
                      <Check className="w-4 h-4 text-[#6BB396]" />
                    ) : (
                      <X className="w-4 h-4 text-[#737780]" />
                    )}
                  </td>
                  <td className="p-4">
                    {row.pytestRerun ? (
                      <Check className="w-4 h-4 text-[#6BB396]" />
                    ) : (
                      <X className="w-4 h-4 text-[#737780]" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-xl bg-[#14161C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-[#F2F1ED] mb-1 font-sans">
            Ready to hunt order-dependent tests?
          </h3>
          <p className="text-xs text-[#A4A6AC]">
            Get started with Python 3.11+ and the included reproduction examples.
          </p>
        </div>
        <Link
          href="/download"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-colors"
        >
          <span>Installation Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
