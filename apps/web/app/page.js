"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [hoveredRole, setHoveredRole] = useState(null);

  return (
    <main className="min-h-screen bg-black text-[#F5F5DC] flex items-center justify-center font-mono selection:bg-[#F5F5DC] selection:text-black">
      {/* 1. This is the container that was missing its closing tag */}
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
        {/* LEFT SIDE: Text & Navigation */}
        <div className="flex flex-col items-start space-y-8">
          {/* Logo / Title */}
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">GigSecure</h1>
            <div className="h-1 w-full bg-[#F5F5DC] mt-2"></div>
          </div>

          {/* Navigation Choices */}
          <div className="w-full flex flex-col space-y-4 text-xl md:text-2xl">
            <div className="flex items-baseline justify-between w-full min-w-[300px]">
              <span className="opacity-80">I am a...</span>

              <div className="flex flex-col items-end space-y-2">
                {/* FREELANCER LINK */}
                <Link
                  href="/freelancer"
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredRole("freelancer")}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <span
                    className={`transition-opacity duration-300 ${hoveredRole === "client" ? "opacity-50" : "opacity-100"}`}
                  >
                    Freelancer
                  </span>
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#F5F5DC] transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* CLIENT LINK */}
                <Link
                  href="/client"
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredRole("client")}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <span
                    className={`transition-opacity duration-300 ${hoveredRole === "freelancer" ? "opacity-50" : "opacity-100"}`}
                  >
                    Client
                  </span>
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#F5F5DC] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Abstract 3D Video */}
        <div className="relative w-64 h-64 md:w-96 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-orange-500 rounded-full blur-3xl opacity-20"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain relative z-10 mix-blend-screen"
          >
            <source src="/orb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Background Noise / Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </main>
  );
}
