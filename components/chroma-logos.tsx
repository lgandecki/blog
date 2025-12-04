"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { gsap } from "gsap";

export interface LogoItem {
  src: string;
  darkSrc?: string; // Optional dark mode variant
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export interface ChromaLogosProps {
  logos: LogoItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

type SetterFn = (v: number | string) => void;

export const ChromaLogos: React.FC<ChromaLogosProps> = ({
  logos,
  className = "",
  radius = 100,
  damping = 0.35,
  fadeOut = 0.5,
  ease = "power3.out",
}) => {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const grayscaleRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: -200, y: -200 });
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const el = grayscaleRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as SetterFn;
    setY.current = gsap.quickSetter(el, "--y", "px") as SetterFn;
    // Start with cursor position outside so everything is grayscale
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
  };

  const handleLeave = () => {
    // Move the "hole" off-screen so grayscale covers everything
    moveTo(-200, -200);
  };

  const LogoRow = ({ isColorLayer }: { isColorLayer: boolean }) => (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 px-8 pb-6">
      {logos.map((logo, i) => {
        // For color layer in dark mode, use darkSrc if available
        const src = isColorLayer && isDark && logo.darkSrc ? logo.darkSrc : logo.src;
        return (
          <Image
            key={i}
            src={src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className={logo.className}
            // Color layer: override CSS to show actual colors
            // Grayscale layer: let the CSS classes handle styling (brightness(0), invert for dark mode, etc.)
            style={isColorLayer ? { filter: "none" } : undefined}
          />
        );
      })}
    </div>
  );

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative -mx-8 -mb-6 ${className}`}
    >
      {/* Color logos (bottom layer) */}
      <LogoRow isColorLayer={true} />

      {/* Original styled logos (top layer) with circular hole mask */}
      <div
        ref={grayscaleRef}
        className="absolute inset-0 pointer-events-none"
        style={
          {
            "--r": `${radius}px`,
            "--x": "-200px",
            "--y": "-200px",
            maskImage:
              "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 40%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 40%, black 100%)",
          } as React.CSSProperties
        }
      >
        {/* Solid background to block color layer */}
        <div className="absolute inset-0 bg-background" />
        {/* Grayscale logos at 60% opacity */}
        <div className="opacity-60">
          <LogoRow isColorLayer={false} />
        </div>
      </div>
    </div>
  );
};
