import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, BookOpen, Code, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — Wobble CLI & Architecture Reference",
  description: "Complete command-line reference, CLI flags, JSON evidence schema, and runner configuration for Wobble.",
};

export default function DocsPage() {
  const huntFlags = [
    {
      flag: "--runs <int>",
      default: "20",
      description: "Number of randomized test execution runs across distinct permutation seeds.",
    },
    {
      flag: "--seed <int>",
      default: "0",
      description: "Initial pseudorandom seed. Shuffled runs increment this seed deterministically.",
    },
    {
      flag: "--minimize",
      default: "false",
      description: "Execute delta debugging (ddmin) to isolate the 1-minimal polluter prefix for failing tests.",
    },
    {
      flag: "--runner <type>",
      default: "local",
      description: "Isolation backend: 'local' (fresh Python processes) or 'docker' (disposable container).",
    },
    {
      flag: "--select <pattern>",
      default: "None",
      description: "Pytest node ID or file pattern to narrow down the target test execution set.",
    },
    {
      flag: "--cpus <float>",
      default: "None",
      description: "CPU quota assigned to each Docker container run (e.g., 0.5 for half a core).",
    },
    {
      flag: "--memory-mb <int>",
      default: "None",
      description: "Strict memory limit in megabytes inside the container runner (e.g., 256).",
    },
    {
      flag: "--clock-shift-seconds <int>",
      default: "0",
      description: "Wall clock offset simulated via libfaketime to test time-boundary flakiness.",
    },
    {
      flag: "--agent",
      default: "false",
      description: "Engage local open-weight model for multi-step causal hypothesis evaluation.",
    },
    {
      flag: "--model <string>",
      default: "qwen3:4b-instruct",
      description: "Local Ollama model identifier to use when --agent or repair is invoked.",
    },
    {
      flag: "--output <filepath>",
      default: "None",
      description: "File path where structured JSON evidence will be written.",
    },
  ];

  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>CLI &amp; API SPECIFICATION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Developer documentation.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Detailed CLI usage, argument flags, JSON report schemas, and container customization guides for Wobble.
        </p>
      </div>

      {/* Command 1: wobble hunt */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-mono">
              wobble hunt &lt;target&gt;
            </h2>
            <span className="text-xs text-[#737780]">
              Stress-test test suites across shuffled permutation orders
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-6">
          The <code className="text-[#F2F1ED]">hunt</code> command scans target test files or directories,
          executes randomized orders, computes binomial failure rates with 95% Wilson intervals,
          and optionally minimizes failing prefixes down to causal polluter tests.
        </p>

        <div className="terminal-window p-4 text-xs font-mono text-[#C0C6D0] mb-6">
          <code>
            .venv/bin/wobble hunt tests/ \\ <br />
            &nbsp;&nbsp;--runs 20 --seed 0 --minimize \\ <br />
            &nbsp;&nbsp;--runner docker --output reports/demo.json
          </code>
        </div>

        {/* Flag Table */}
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#14161C] text-[#A4A6AC]">
                <th className="p-3">Argument Flag</th>
                <th className="p-3">Default</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#A4A6AC]">
              {huntFlags.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="p-3 text-[#F2F1ED] font-semibold">{item.flag}</td>
                  <td className="p-3 text-[#737780]">{item.default}</td>
                  <td className="p-3 text-[#A4A6AC]">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Command 2: wobble repair */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6BB396]">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F2F1ED] font-mono">
              wobble repair &lt;target&gt;
            </h2>
            <span className="text-xs text-[#737780]">
              Evaluate evidence, propose candidate patch, and verify in isolated copy
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-6">
          The <code className="text-[#F2F1ED]">repair</code> command ingests prior hunt evidence, presents the
          reproducer and test code to a local model, generates a targeted patch, and verifies it across repeated runs
          before outputting a patch diff file.
        </p>

        <div className="terminal-window p-4 text-xs font-mono text-[#C0C6D0]">
          <code>
            .venv/bin/wobble repair examples/order_dependent \\ <br />
            &nbsp;&nbsp;--evidence reports/demo.json \\ <br />
            &nbsp;&nbsp;--model qwen3:4b-instruct \\ <br />
            &nbsp;&nbsp;--output reports/repair.json \\ <br />
            &nbsp;&nbsp;--patch-output reports/model-fix.diff
          </code>
        </div>
      </div>

      {/* JSON Schema */}
      <div className="mb-16 p-8 rounded-xl bg-[#101216] border border-white/10">
        <h2 className="text-xl font-bold text-[#F2F1ED] font-sans mb-3">
          Evidence JSON Schema Structure
        </h2>
        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          All reports conform to a deterministic machine-readable JSON format:
        </p>

        <div className="terminal-window p-4 text-xs font-mono text-[#A4A6AC] overflow-x-auto">
          <pre>
            <code>
{`{
  "$schema": "https://wobble.dev/schemas/v1/evidence.json",
  "schema_version": "1.0",
  "target": "path/to/tests",
  "runner": "docker",
  "profile": {
    "cpus": 0.5,
    "memory_mb": 256,
    "clock_shift_seconds": 3600
  },
  "flaky_tests": [
    {
      "node_id": "test_module.py::test_victim",
      "observed_flaky": true,
      "passes": 6,
      "failures": 14,
      "failure_rate": 0.7,
      "wilson_95_ci": [0.481, 0.855],
      "minimized_reproducer": [
        "test_module.py::test_polluter",
        "test_module.py::test_victim"
      ]
    }
  ]
}`}
            </code>
          </pre>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/download" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; Download CLI
        </Link>
        <Link href="/contribute" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Contribute to Wobble</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
