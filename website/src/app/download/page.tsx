import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, Download, Copy, Check, ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Download & Setup — Wobble Python CLI",
  description: "Official installation guide and configuration for the Wobble Python CLI, Docker runner image, and local Ollama model integration.",
};

export default function DownloadPage() {
  return (
    <div className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>OFFICIAL DISTRIBUTION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-6 font-sans">
          Download &amp; installation guide.
        </h1>
        <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed">
          Wobble is distributed as an open-source Python CLI. Follow the verified installation
          instructions below for your local virtual environment, container runner, or Ollama setup.
        </p>
      </div>

      {/* System Requirements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
        <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] block mb-1">
            Core Runtime
          </span>
          <div className="text-base font-bold text-[#F2F1ED] font-mono mb-1">
            Python 3.11+
          </div>
          <p className="text-xs text-[#A4A6AC]">
            Supports Linux, macOS, and POSIX-compliant environments with pytest installed.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] block mb-1">
            Optional Runner
          </span>
          <div className="text-base font-bold text-[#F2F1ED] font-mono mb-1">
            Docker Engine 20.10+
          </div>
          <p className="text-xs text-[#A4A6AC]">
            Required only for container isolation, CPU/memory quotas, and wall clock simulation.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-[#101216] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] block mb-1">
            Optional AI Agent
          </span>
          <div className="text-base font-bold text-[#F2F1ED] font-mono mb-1">
            Ollama 0.1.30+
          </div>
          <p className="text-xs text-[#A4A6AC]">
            Required for local model hypothesis generation (<code className="text-[#6B8CAE]">qwen3:4b-instruct</code>).
          </p>
        </div>
      </div>

      {/* Step 1: Clone & Venv Setup */}
      <div className="mb-12 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#F2F1ED] font-sans">
            1. Install Wobble via Git &amp; Virtualenv
          </h2>
          <span className="text-xs font-mono text-[#6BB396]">Verified Command</span>
        </div>
        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          Clone the official repository and install Wobble into an isolated Python 3.11+ virtual environment:
        </p>

        <div className="terminal-window p-4 text-xs sm:text-sm font-mono text-[#C0C6D0] overflow-x-auto mb-4">
          <pre>
            <code>
{`# Clone the Wobble repository
git clone https://github.com/RajaShirjeel/Wobble.git
cd Wobble

# Create a clean Python 3.11+ virtual environment
python3 -m venv .venv

# Install Wobble in editable development mode
.venv/bin/python -m pip install -e .

# Confirm the CLI binary is ready
.venv/bin/wobble --help`}
            </code>
          </pre>
        </div>
      </div>

      {/* Step 2: Docker Runner Build */}
      <div className="mb-12 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#F2F1ED] font-sans">
            2. Build Ephemeral Docker Runner (Optional)
          </h2>
          <span className="text-xs font-mono text-[#6B8CAE]">Sandboxed Runner</span>
        </div>
        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          Build the lightweight container runner containing pytest and libfaketime hooks:
        </p>

        <div className="terminal-window p-4 text-xs sm:text-sm font-mono text-[#C0C6D0] overflow-x-auto mb-4">
          <pre>
            <code>
{`# Build the runner image tagged wobble-pytest:py311
docker build -f Dockerfile.runner -t wobble-pytest:py311 .

# Run a hunt with container isolation
.venv/bin/wobble hunt examples/order_dependent --runner docker --runs 20 --seed 0 --minimize`}
            </code>
          </pre>
        </div>
      </div>

      {/* Step 3: Ollama Local Model Setup */}
      <div className="mb-12 p-8 rounded-xl bg-[#101216] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#F2F1ED] font-sans">
            3. Setup Local Ollama Model (Optional)
          </h2>
          <span className="text-xs font-mono text-[#E5A962]">Local AI</span>
        </div>
        <p className="text-xs text-[#A4A6AC] leading-relaxed mb-4">
          Pull the default open-weight reasoning model into your local Ollama daemon:
        </p>

        <div className="terminal-window p-4 text-xs sm:text-sm font-mono text-[#C0C6D0] overflow-x-auto mb-4">
          <pre>
            <code>
{`# Pull the Qwen3 4B Instruct model
ollama pull qwen3:4b-instruct

# Verify model presence
ollama list

# Run model-assisted investigation
.venv/bin/wobble hunt examples/order_dependent \\
  --runner docker --runs 20 --seed 0 \\
  --agent --model qwen3:4b-instruct \\
  --output reports/agent.json`}
            </code>
          </pre>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <Link href="/safety" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; Safety Boundaries
        </Link>
        <Link href="/docs" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>CLI Documentation &amp; Flags</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
