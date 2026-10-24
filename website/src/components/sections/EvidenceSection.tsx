"use client";

import React, { useState } from "react";
import { Terminal, FileCode, CheckCircle2, ShieldAlert, BarChart3, Copy, Check } from "lucide-react";

export default function EvidenceSection() {
  const [activeTab, setActiveTab] = useState<"cli" | "json" | "diff">("cli");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cliOutput = `$ .venv/bin/wobble hunt examples/order_dependent \\
    --runs 20 --seed 0 --minimize --output reports/demo.json

[wobble] Collecting pytest node IDs from examples/order_dependent...
[wobble] Found 2 target tests across 1 file.
[wobble] Running 20 randomized permutation orders (seed=0)...
.................... [100%]

========================= WOBBLE FLAKINESS REPORT =========================
Target: examples/order_dependent/test_state.py::test_b_victim
Observed Flaky: YES (Passes: 6, Failures: 14)
Failure Rate: 70.0% (14/20 runs)
Wilson 95% Interval: [48.1%, 85.5%]

Minimizer Status: 1-Minimal Prefix Isolated
Polluter: examples/order_dependent/test_state.py::test_a_polluter
Victim:   examples/order_dependent/test_state.py::test_b_victim

[wobble] Evidence written to reports/demo.json`;

  const jsonEvidence = `{
  "target": "examples/order_dependent",
  "seed": 0,
  "runs": 20,
  "runner": "local_process",
  "flaky_tests": [
    {
      "node_id": "test_state.py::test_b_victim",
      "observed_flaky": true,
      "passes": 6,
      "failures": 14,
      "failure_rate": 0.70,
      "wilson_95_ci": [0.481, 0.855],
      "minimized_reproducer": [
        "test_state.py::test_a_polluter",
        "test_state.py::test_b_victim"
      ]
    }
  ],
  "reproducible": true
}`;

  const patchDiff = `--- a/examples/order_dependent/test_state.py
+++ b/examples/order_dependent/test_state.py
@@ -1,6 +1,11 @@
+import pytest
+
 GLOBAL_CACHE = {}

+@pytest.fixture(autouse=True)
+def clear_global_cache():
+    GLOBAL_CACHE.clear()
+
 def test_a_polluter():
     GLOBAL_CACHE["auth_override"] = True
     assert len(GLOBAL_CACHE) == 1`;

  return (
    <section id="evidence" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>03 / AUDITABLE ARTIFACTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            Evidence, not guesses.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            Every investigation yields structured, machine-readable evidence files:
            exact execution orders, seed logs, Wilson interval calculations, and isolated patch verifications.
          </p>
        </div>

        {/* Evidence Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Key Empirical Metrics Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-[#737780] mb-2">
                <span>STATISTICAL CERTAINTY</span>
                <BarChart3 className="w-4 h-4 text-[#6B8CAE]" />
              </div>
              <div className="text-2xl font-bold text-[#F2F1ED] font-mono mb-1">
                [48.1%, 85.5%]
              </div>
              <p className="text-xs text-[#A4A6AC]">
                95% Wilson confidence score interval derived from 20 randomized seed executions.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-[#737780] mb-2">
                <span>PREFIX MINIMIZATION</span>
                <CheckCircle2 className="w-4 h-4 text-[#6BB396]" />
              </div>
              <div className="text-2xl font-bold text-[#F2F1ED] font-mono mb-1">
                2 Tests
              </div>
              <p className="text-xs text-[#A4A6AC]">
                Reduced failing sequence from full permutation down to minimal causal pair: <code className="text-[#6B8CAE]">test_a -&gt; test_b</code>.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-[#737780] mb-2">
                <span>PATCH VALIDATION</span>
                <ShieldAlert className="w-4 h-4 text-[#E5A962]" />
              </div>
              <div className="text-2xl font-bold text-[#6BB396] font-mono mb-1">
                20 / 20 Verified
              </div>
              <p className="text-xs text-[#A4A6AC]">
                Model-proposed candidate patch survived 20 re-shuffled perturbation runs in clean isolation before diff export.
              </p>
            </div>
          </div>

          {/* Main Interactive Inspector Window */}
          <div className="lg:col-span-8 terminal-window overflow-hidden flex flex-col">
            {/* Header with Navigation Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121419]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("cli")}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                    activeTab === "cli"
                      ? "bg-white/10 text-[#F2F1ED] font-medium"
                      : "text-[#737780] hover:text-[#A4A6AC]"
                  }`}
                >
                  CLI Log
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                    activeTab === "json"
                      ? "bg-white/10 text-[#F2F1ED] font-medium"
                      : "text-[#737780] hover:text-[#A4A6AC]"
                  }`}
                >
                  reports/demo.json
                </button>
                <button
                  onClick={() => setActiveTab("diff")}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                    activeTab === "diff"
                      ? "bg-white/10 text-[#F2F1ED] font-medium"
                      : "text-[#737780] hover:text-[#A4A6AC]"
                  }`}
                >
                  reports/model-fix.diff
                </button>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === "cli"
                      ? cliOutput
                      : activeTab === "json"
                      ? jsonEvidence
                      : patchDiff
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#A4A6AC] hover:text-[#F2F1ED] rounded hover:bg-white/5 transition-colors"
                aria-label="Copy inspector content"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6BB396]" />
                    <span className="text-[#6BB396]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-x-auto min-h-[340px] text-xs sm:text-sm font-mono leading-relaxed">
              {activeTab === "cli" && (
                <pre className="text-[#C0C6D0] whitespace-pre">
                  <code>{cliOutput}</code>
                </pre>
              )}

              {activeTab === "json" && (
                <pre className="text-[#A4A6AC] whitespace-pre">
                  <code>{jsonEvidence}</code>
                </pre>
              )}

              {activeTab === "diff" && (
                <pre className="text-[#A4A6AC] whitespace-pre">
                  <code>{patchDiff}</code>
                </pre>
              )}
            </div>

            {/* Verification Watermark */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#0C0E12] flex items-center justify-between text-xs font-mono text-[#737780]">
              <span>Harness: pytest 8.x + wobble engine</span>
              <span className="text-[#6BB396]">Status: PASS (VERIFIED)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
