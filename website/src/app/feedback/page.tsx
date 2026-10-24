"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquareHeart, CheckCircle2, ArrowRight, Send, AlertCircle } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    category: "order_dependent_bug",
    pythonVersion: "3.11",
    pytestVersion: "8.x",
    runner: "local",
    description: "",
    reproducerTrace: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-24 px-6 lg:px-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-14 pt-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-medium text-[#6B8CAE] bg-[#6B8CAE]/10 border border-[#6B8CAE]/20 mb-3">
          <span>COMMUNITY FEEDBACK</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F2F1ED] mb-4 font-sans">
          Send feedback &amp; <br />
          reproduction traces.
        </h1>
        <p className="text-base text-[#A4A6AC] leading-relaxed">
          Encountered a complex order-dependency, an unexpected minimizer outcome, or a Docker runner edge case?
          Submit your report directly or file a GitHub issue.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-xl bg-[#101216] border border-[#6BB396]/30 space-y-4">
          <div className="flex items-center gap-3 text-[#6BB396]">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-lg font-bold font-sans">Report Received</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A4A6AC] leading-relaxed">
            Thank you for contributing to Wobble&apos;s empirical test reliability.
            For critical bug tracking or pull requests, you can also cross-post this report on GitHub:
          </p>
          <div className="pt-4 flex items-center gap-4">
            <a
              href="https://github.com/RajaShirjeel/Wobble/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Open Issue on GitHub</span>
            </a>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-mono text-[#A4A6AC] hover:text-[#F2F1ED] underline underline-offset-4"
            >
              Submit another report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-xl bg-[#101216] border border-white/10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
                Report Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
              >
                <option value="order_dependent_bug">Order-Dependent Test Failure</option>
                <option value="minimizer_issue">Delta Debugging (ddmin) Edge Case</option>
                <option value="docker_runner">Docker Runner / Sandbox Limitation</option>
                <option value="libfaketime">Clock Shift (libfaketime) Discrepancy</option>
                <option value="local_model">Local Model / Ollama Action Suggestion</option>
                <option value="general_feedback">General Feedback &amp; Improvements</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
                Execution Runner
              </label>
              <select
                value={formData.runner}
                onChange={(e) => setFormData({ ...formData, runner: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
              >
                <option value="local">Local Python Process</option>
                <option value="docker">Docker Disposable Container</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
                Python Runtime
              </label>
              <input
                type="text"
                value={formData.pythonVersion}
                onChange={(e) => setFormData({ ...formData, pythonVersion: e.target.value })}
                placeholder="e.g. 3.11.8 or 3.12.1"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
                Pytest Version
              </label>
              <input
                type="text"
                value={formData.pytestVersion}
                onChange={(e) => setFormData({ ...formData, pytestVersion: e.target.value })}
                placeholder="e.g. 8.1.1"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
              Failure Summary &amp; Behavior Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what occurred during the hunt or minimize command..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#A4A6AC] mb-2">
              Terminal Trace or Minimized Reproducer (Optional)
            </label>
            <textarea
              rows={4}
              value={formData.reproducerTrace}
              onChange={(e) => setFormData({ ...formData, reproducerTrace: e.target.value })}
              placeholder="Paste terminal log or failing test sequence..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#171A20] border border-white/10 text-xs font-mono text-[#F2F1ED] focus:outline-none focus:border-[#6B8CAE]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#737780]">
              Submitted data is kept strictly confidential within the maintainer team.
            </span>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      )}

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-10 border-t border-white/10 text-xs font-mono mt-14">
        <Link href="/team" className="text-[#A4A6AC] hover:text-[#F2F1ED] transition-colors">
          &larr; Maintainers &amp; Team
        </Link>
        <Link href="/docs" className="text-[#6B8CAE] hover:text-[#F2F1ED] inline-flex items-center gap-1 transition-colors">
          <span>Documentation Reference</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
