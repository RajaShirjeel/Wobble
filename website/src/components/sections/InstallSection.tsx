"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, Cpu, Layers, ArrowRight } from "lucide-react";
import { DockerIcon } from "@/components/icons/CustomIcons";

export default function InstallSection() {
  const [activeTab, setActiveTab] = useState<"cli" | "docker" | "ollama">("cli");
  const [copied, setCopied] = useState(false);

  const installGuides = {
    cli: {
      title: "Local Python Environment",
      prereq: "Python 3.11 or newer",
      commands: `# 1. Clone repository & create virtual environment
git clone https://github.com/RajaShirjeel/Wobble.git
cd Wobble
python3 -m venv .venv

# 2. Install Wobble in editable development mode
.venv/bin/python -m pip install -e .

# 3. Verify installation and inspect CLI flags
.venv/bin/wobble --help`,
    },
    docker: {
      title: "Ephemeral Container Runner",
      prereq: "Docker Engine 20.10+",
      commands: `# 1. Build the sandboxed runner image
docker build -f Dockerfile.runner -t wobble-pytest:py311 .

# 2. Run order-dependent hunt with container isolation
.venv/bin/wobble hunt examples/order_dependent \\
  --runner docker --runs 20 --seed 0 --minimize

# 3. Simulate resource constraints & clock shift
.venv/bin/wobble hunt examples/order_dependent \\
  --runner docker --runs 20 --seed 0 \\
  --cpus 0.5 --memory-mb 256 --clock-shift-seconds 3600 \\
  --output reports/shifted.json`,
    },
    ollama: {
      title: "Model-Assisted Investigation",
      prereq: "Ollama with open-weight model",
      commands: `# 1. Pull the recommended open-weight model
ollama pull qwen3:4b-instruct
ollama list

# 2. Run agent investigation with bounded actions
.venv/bin/wobble hunt examples/order_dependent \\
  --runner docker --runs 20 --seed 0 \\
  --agent --model qwen3:4b-instruct \\
  --output reports/agent.json

# 3. Propose and verify targeted repair in disposable copy
.venv/bin/wobble repair examples/order_dependent \\
  --evidence reports/agent.json --model qwen3:4b-instruct \\
  --output reports/repair.json --patch-output reports/model-fix.diff`,
    },
  };

  const current = installGuides[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="relative py-28 px-6 lg:px-16 border-t border-white/[0.08] bg-[#090A0C]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
            <span>05 / GETTING STARTED</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
            Install and run in minutes.
          </h2>
          <p className="text-base text-[#A4A6AC] leading-relaxed">
            Wobble is distributed as an open-source Python tool with optional Docker
            containerization and local model integration. No cloud subscriptions or proprietary API keys.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("cli")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "cli"
                ? "bg-[#171A20] text-[#F2F1ED] border border-white/20 shadow-lg"
                : "text-[#737780] hover:text-[#A4A6AC] border border-transparent"
            }`}
          >
            1. Python CLI
          </button>
          <button
            onClick={() => setActiveTab("docker")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "docker"
                ? "bg-[#171A20] text-[#F2F1ED] border border-white/20 shadow-lg"
                : "text-[#737780] hover:text-[#A4A6AC] border border-transparent"
            }`}
          >
            2. Docker Runner
          </button>
          <button
            onClick={() => setActiveTab("ollama")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "ollama"
                ? "bg-[#171A20] text-[#F2F1ED] border border-white/20 shadow-lg"
                : "text-[#737780] hover:text-[#A4A6AC] border border-transparent"
            }`}
          >
            3. Local Ollama Model
          </button>
        </div>

        {/* Terminal Window */}
        <div className="terminal-window overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#121419]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="text-xs font-mono text-[#A4A6AC]">
                {current.title} • Requires: {current.prereq}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#A4A6AC] hover:text-[#F2F1ED] rounded hover:bg-white/5 transition-colors"
              aria-label="Copy shell snippet"
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

          {/* Commands Body */}
          <div className="p-6 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
            <pre className="text-[#C0C6D0] whitespace-pre">
              <code>{current.commands}</code>
            </pre>
          </div>

          {/* Footer Callout */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#0C0E12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#737780]">
            <span>Need advanced configuration or CI pipeline integrations?</span>
            <Link
              href="/download"
              className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors"
            >
              <span>View full installation matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
