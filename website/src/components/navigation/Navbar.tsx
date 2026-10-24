"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShieldCheck, Terminal, BookOpen, Layers, GitPullRequest } from "lucide-react";
import { GithubIcon } from "@/components/icons/CustomIcons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Navbar() {
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navDims, setNavDims] = useState({ width: 960, height: 46 });
  const [pathPerimeter, setPathPerimeter] = useState(2000);

  const [headPos, setHeadPos] = useState<{ x: number; y: number } | null>(null);

  // ResizeObserver for continuous, pixel-perfect dimension tracking
  useEffect(() => {
    const el = navContainerRef.current;
    if (!el) return;

    const updateDims = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setNavDims({ width: rect.width, height: rect.height });
      }
    };

    updateDims();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setNavDims({ width: rect.width, height: rect.height });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure path length when dimensions update
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) {
          setPathPerimeter(len);
          return;
        }
      } catch {
        // fallback
      }
    }
    const w = navDims.width;
    const h = navDims.height;
    const r = Math.max((h - 2.5) / 2, 1);
    const straight = Math.max(w - 2.5 - 2 * r, 0);
    const approx = 2 * straight + 2 * Math.PI * r;
    setPathPerimeter(approx > 0 ? approx : 2000);
  }, [navDims]);

  // Compute glowing head position at the tip of the progressive line
  useEffect(() => {
    if (!pathRef.current || scrollProgress <= 0.002) {
      setHeadPos(null);
      return;
    }
    try {
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        const currentLen = Math.min(Math.max(len * scrollProgress, 0), len);
        const pt = pathRef.current.getPointAtLength(currentLen);
        setHeadPos({ x: pt.x, y: pt.y });
      }
    } catch {
      setHeadPos(null);
    }
  }, [scrollProgress, navDims]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // GSAP ScrollTrigger for navbar pill compaction and page scroll progress
    const ctx = gsap.context(() => {
      // Full document scroll progress tracker
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });

      // Compaction trigger over the first 160px
      ScrollTrigger.create({
        start: "top top",
        end: "+=160",
        onUpdate: (self) => {
          const p = self.progress;
          if (navContainerRef.current) {
            gsap.set(navContainerRef.current, {
              maxWidth: gsap.utils.interpolate("960px", "680px", p),
              paddingLeft: gsap.utils.interpolate("24px", "16px", p),
              paddingRight: gsap.utils.interpolate("24px", "16px", p),
              backgroundColor: gsap.utils.interpolate(
                "rgba(16, 18, 22, 0.70)",
                "rgba(14, 16, 20, 0.92)",
                p
              ),
              boxShadow: gsap.utils.interpolate(
                "0 8px 24px rgba(0,0,0,0.3)",
                "0 16px 36px rgba(0,0,0,0.55)",
                p
              ),
            });
          }
        },
      });
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert();
    };
  }, []);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Safety", href: "/safety" },
    { label: "Docs", href: "/docs" },
    { label: "Download", href: "/download" },
  ];

  // Mathematical Pill Path starting at Top Left tangent point
  const strokeW = 2.5;
  const offset = strokeW / 2; // 1.25px inset ensures stroke kisses outer edge
  const w = navDims.width;
  const h = navDims.height;
  const r = Math.max((h - 2 * offset) / 2, 1);
  const leftX = offset + r;
  const rightX = Math.max(w - offset - r, leftX);
  const topY = offset;
  const bottomY = h - offset;

  // Single continuous clockwise loop:
  // Top edge (left to right) -> Right semicircular cap -> Bottom edge (right to left) -> Left semicircular cap
  const pillPathD = `M ${leftX} ${topY} L ${rightX} ${topY} A ${r} ${r} 0 0 1 ${rightX} ${bottomY} L ${leftX} ${bottomY} A ${r} ${r} 0 0 1 ${leftX} ${topY}`;

  // Length of the active stroke based on overall scroll progress
  const progressLength = Math.min(
    Math.max(pathPerimeter * scrollProgress, 0),
    pathPerimeter
  );

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <div
        ref={navContainerRef}
        className="relative pointer-events-auto flex items-center justify-between w-full max-w-[960px] h-[46px] rounded-full backdrop-blur-xl px-6 shadow-2xl transition-all duration-200"
        style={{
          backgroundColor: "rgba(16, 18, 22, 0.7)",
        }}
      >
        {/* Dynamic Progressive Scroll Perimeter Ring */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
          aria-hidden="true"
        >
          {/* Subtle Outer Track (serves as the navbar's architectural border) */}
          <path
            d={pillPathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />
          {/* Active Progressive Stroke with Smooth Rounded Caps */}
          <path
            ref={pathRef}
            d={pillPathD}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${progressLength} ${pathPerimeter * 2}`}
            strokeDashoffset="0"
            filter="url(#progressSoftGlow)"
            style={{
              opacity: scrollProgress > 0.003 ? Math.min((scrollProgress - 0.003) * 50, 1) : 0,
              transition: "opacity 0.2s ease",
            }}
          />
          {/* Luminous Glowing Pearl at the leading tip of the line */}
          {headPos && scrollProgress > 0.005 && (
            <g style={{ opacity: Math.min((scrollProgress - 0.005) * 40, 1) }}>
              <circle
                cx={headPos.x}
                cy={headPos.y}
                r="6"
                fill="#6B8CAE"
                opacity="0.45"
                filter="url(#headBlur)"
              />
              <circle
                cx={headPos.x}
                cy={headPos.y}
                r="2.5"
                fill="#FFFFFF"
                filter="url(#headGlow)"
              />
            </g>
          )}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E9EB8" />
              <stop offset="50%" stopColor="#A2BDD7" />
              <stop offset="100%" stopColor="#F0F4F8" />
            </linearGradient>
            <filter id="progressSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#6B8CAE" floodOpacity="0.6" />
            </filter>
            <filter id="headBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <filter id="headGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#94B3D4" floodOpacity="0.9" />
            </filter>
          </defs>
        </svg>

        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Link
            href="/"
            className="group flex items-center focus:outline-none"
            aria-label="Wobble Home"
          >
            <img
              src="/logo.svg"
              alt="Wobble"
              className="h-[30px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1 z-10"
          aria-label="Primary Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 text-xs font-medium tracking-wide rounded-full transition-all duration-150 ${
                  isActive
                    ? "text-[#F2F1ED] bg-white/[0.08] shadow-inner font-semibold"
                    : "text-[#A4A6AC] hover:text-[#F2F1ED] hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: GitHub / Action */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <a
            href="https://github.com/RajaShirjeel/Wobble"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#F2F1ED] bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 rounded-full transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#6B8CAE]"
            aria-label="GitHub Repository (opens in new window)"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-[#A4A6AC]" />
          </a>
        </div>
      </div>
    </header>
  );
}
