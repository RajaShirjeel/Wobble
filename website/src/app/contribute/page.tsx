import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GitPullRequest, Terminal, CheckCircle2, ArrowRight } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export const metadata: Metadata = {
  title: "Contribute — Wobble Open Source",
  description: "Guidelines, development environment setup, and pull request criteria for contributing to the Wobble project.",
};

export default function ContributePage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>COMMUNITY CONTRIBUTING</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Contribute to Wobble.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Wobble is an open-source project licensed under MIT. We welcome contributions from engineers
          working on pytest extensions, container sandboxing, delta debugging algorithms, and local LLM tool contracts.
        </p>
      </div>

      {/* Development Environment Setup */}
      <div className="mb-14 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-[#171A20] border border-white/10 flex items-center justify-center text-[#6B8CAE]">
            <Terminal className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#F2F1ED] font-sans">
            Setting Up Local Development
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed mb-4">
          Clone the repository, create a dedicated virtualenv, and install developer dependencies:
        </p>

        <div className="terminal-window p-4 text-xs sm:text-sm font-mono text-[#C0C6D0] overflow-x-auto mb-4">
          <pre>
            <code>
{`# 1. Fork and clone the repository
git clone https://github.com/<your-username>/Wobble.git
cd Wobble

# 2. Create virtual environment with Python 3.11+
python3 -m venv .venv
source .venv/bin/activate

# 3. Install in editable mode with development dependencies
pip install -e ".[dev]"

# 4. Run the internal test suite
pytest tests/`}
            </code>
          </pre>
        </div>
      </div>

      {/* Pull Request Criteria */}
      <div className="mb-14 p-8 rounded-xl bg-[#101216] border border-white/10">
        <h2 className="text-xl font-bold text-[#F2F1ED] font-sans mb-4">
          Pull Request Acceptance Criteria
        </h2>

        <div className="space-y-4 text-xs text-[#A4A6AC] leading-relaxed">
          <div className="flex items-start gap-3 p-3.5 rounded bg-[#171A20] border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-[#6BB396] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F2F1ED] block mb-0.5">Regression Test Included:</strong>
              Every bug fix or algorithm modification must be accompanied by an order-dependent test case in <code className="text-[#6B8CAE]">tests/</code> or an illustrative scenario in <code className="text-[#6B8CAE]">examples/</code>.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded bg-[#171A20] border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-[#6BB396] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F2F1ED] block mb-0.5">Strict Local-First Mandate:</strong>
              No PR may introduce external telemetry, tracking SDKs, or cloud API dependencies. Inferences must remain compatible with local Ollama.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded bg-[#171A20] border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-[#6BB396] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F2F1ED] block mb-0.5">Type Annotations &amp; Linting:</strong>
              Code must pass <code className="text-[#6B8CAE]">ruff</code> and <code className="text-[#6B8CAE]">mypy --strict</code> checks.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-xl bg-[#14161C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-[#F2F1ED] mb-1 font-sans">
            Ready to submit a pull request?
          </h3>
          <p className="text-xs text-[#A4A6AC]">
            Open PRs directly on the official GitHub repository.
          </p>
        </div>
        <a
          href="https://github.com/RajaShirjeel/Wobble/pulls"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-medium text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-colors shrink-0"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Open Pull Request</span>
        </a>
      </div>
    </div>
  );
}
