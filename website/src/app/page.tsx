import React from "react";
import HeroSection from "@/components/hero/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import WorkflowSection from "@/components/sections/WorkflowSection";
import EvidenceSection from "@/components/sections/EvidenceSection";
import SafetySection from "@/components/sections/SafetySection";
import InstallSection from "@/components/sections/InstallSection";
import CommunitySection from "@/components/sections/CommunitySection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero with 3D Centerpiece */}
      <HeroSection />

      {/* 2. The Problem: Shared State Pollution & Order Dependencies */}
      <ProblemSection />

      {/* 3. How Wobble Works: Hunt -> Minimize -> Investigate -> Repair -> Verify */}
      <WorkflowSection />

      {/* 4. Evidence, Not Guesses: Auditable CLI, JSON Reports, and Verified Diffs */}
      <EvidenceSection />

      {/* 5. Local-First AI & Safety: Docker Isolation, Local Models, Honest Limits */}
      <SafetySection />

      {/* 6. Installation: Real CLI, Docker runner, and Ollama Instructions */}
      <InstallSection />

      {/* 7. Open-Source Ecosystem: GitHub, Issues, Discussions, MIT License */}
      <CommunitySection />
    </div>
  );
}
