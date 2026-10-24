"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Terminal, Shield, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";
import Hero3DScene from "./Hero3DScene";

export default function HeroSection() {
  const scrollToInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("install");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToProblem = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("problem");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 lg:px-16 overflow-hidden tech-grid-bg"
    >
      {/* Three.js 3D Focal Centerpiece */}
      <Hero3DScene />

      {/* Atmospheric Radial Gradient Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(107,140,174,0.12),transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.03),transparent_60%)]" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#171A20] border border-white/10 text-xs font-mono text-[#A4A6AC] shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6BB396] animate-pulse" />
            <span className="text-[#F2F1ED] font-medium">Wobble Engine</span>
            <span className="text-[#737780]">•</span>
            <span>Local Flaky Test Investigation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F2F1ED] leading-[1.08] mb-6 font-sans">
            Your flaky tests <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2F1ED] via-[#C0C6D0] to-[#6B8CAE]">
              have a reason.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#A4A6AC] leading-relaxed max-w-xl mb-9 font-normal">
            Wobble stress-tests your Python suite in isolated environments, finds
            the conditions behind order-dependent failures, and verifies
            targeted fixes through randomized reruns.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-10">
            <a
              href="#install"
              onClick={scrollToInstall}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold tracking-wide text-[#090A0C] bg-[#F2F1ED] hover:bg-white transition-all duration-150 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#6B8CAE]"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/RajaShirjeel/Wobble"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium tracking-wide text-[#F2F1ED] bg-[#171A20]/80 hover:bg-[#171A20] border border-white/12 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <GithubIcon className="w-4 h-4 text-[#A4A6AC]" />
              <span>Explore GitHub</span>
            </a>
          </div>

          {/* Technical Credentials Pill Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#737780]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#A4A6AC]" />
              <span>Python 3.11+ Pytest</span>
            </div>
            <span className="hidden sm:inline text-white/10">•</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#6B8CAE]" />
              <span>Docker & Time Isolation</span>
            </div>
            <span className="hidden sm:inline text-white/10">•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A962]" />
              <span>Local Ollama Qwen3</span>
            </div>
          </div>
        </div>

        {/* Right Space reserved for 3D Visual focal immersion on desktop */}
        <div className="lg:col-span-5 hidden lg:block h-[420px] pointer-events-none" />
      </div>

      {/* Minimal Scroll Indicator */}
      <a
        href="#problem"
        onClick={scrollToProblem}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs font-mono tracking-widest text-[#737780] hover:text-[#F2F1ED] transition-colors focus:outline-none"
        aria-label="Scroll to learn about order-dependent test failures"
      >
        <span className="text-[10px] uppercase">Scroll</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#A4A6AC]" />
      </a>
    </section>
  );
}
