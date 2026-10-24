"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[#07080A] text-[#A4A6AC] py-16 px-6 lg:px-16 text-xs">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand Column */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block focus:outline-none" aria-label="Wobble Home">
            <img
              src="/logo.svg"
              alt="Wobble"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <p className="text-xs text-[#737780] leading-relaxed max-w-sm">
            Deterministic open-source investigation engine for order-dependent pytest failures.
            Local execution, container isolation, and empirical patch verification.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://github.com/RajaShirjeel/Wobble"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101216] border border-white/10 text-xs font-mono text-[#F2F1ED] hover:bg-[#171A20] transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-[#737780]" />
            </a>

            <span className="text-[11px] font-mono text-[#737780]">
              Py3.11+ • Pytest 8.x
            </span>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="space-y-3">
          <div className="font-mono text-[11px] font-semibold text-[#F2F1ED] uppercase tracking-wider">
            Product
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/features" className="hover:text-[#F2F1ED] transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-[#F2F1ED] transition-colors">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/safety" className="hover:text-[#F2F1ED] transition-colors">
                Safety &amp; Limits
              </Link>
            </li>
            <li>
              <Link href="/download" className="hover:text-[#F2F1ED] transition-colors">
                Download &amp; Setup
              </Link>
            </li>
          </ul>
        </div>

        {/* Documentation & Resources */}
        <div className="space-y-3">
          <div className="font-mono text-[11px] font-semibold text-[#F2F1ED] uppercase tracking-wider">
            Documentation
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/docs" className="hover:text-[#F2F1ED] transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-[#F2F1ED] transition-colors">
                Feedback &amp; Reports
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="hover:text-[#F2F1ED] transition-colors">
                Contribute
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/RajaShirjeel/Wobble/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F2F1ED] transition-colors inline-flex items-center gap-1"
              >
                <span>License (MIT)</span>
                <ArrowUpRight className="w-3 h-3 text-[#737780]" />
              </a>
            </li>
          </ul>
        </div>

        {/* Project & Community */}
        <div className="space-y-3">
          <div className="font-mono text-[11px] font-semibold text-[#F2F1ED] uppercase tracking-wider">
            Project
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-[#F2F1ED] transition-colors">
                About Wobble
              </Link>
            </li>
            <li>
              <Link href="/team" className="hover:text-[#F2F1ED] transition-colors">
                Maintainers &amp; Team
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/RajaShirjeel/Wobble/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F2F1ED] transition-colors inline-flex items-center gap-1"
              >
                <span>Discussions</span>
                <ArrowUpRight className="w-3 h-3 text-[#737780]" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright & Bottom Bar */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#737780] font-mono text-[11px]">
        <div>
          &copy; {currentYear} Raja Shirjeel and Wobble Contributors. Open-source under MIT.
        </div>
        <div className="flex items-center gap-4">
          <span>Zero Telemetry</span>
          <span>•</span>
          <span>Local Execution</span>
          <span>•</span>
          <span>Wilson 95% CI</span>
        </div>
      </div>
    </footer>
  );
}
