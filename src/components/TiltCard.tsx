"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * =========================================================================
 * 🎴 3D TILT CARD COMPONENT
 * Tilts smoothly towards the user's cursor with dynamic specular glare.
 * Automatically disabled on touch screens to ensure silky 60fps scrolling!
 * =========================================================================
 */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  max?: number; // Optional alias for maxTiltAngle
  maxTiltAngle?: number; // Maximum tilt in degrees (default 10)
}

export default function TiltCard({
  children,
  className = "",
  max,
  maxTiltAngle = 10,
}: TiltCardProps) {
  const tiltLimit = max ?? maxTiltAngle;
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Check if the current device has a real mouse/hover capability
    isTouchDevice.current = !window.matchMedia("(hover: hover)").matches;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Skip heavy tilt on touch devices (phones/tablets) to ensure buttery smooth scrolling
    if (isTouchDevice.current) return;

    const card = cardRef.current;
    if (!card) return;

    // Throttle style recalculations using requestAnimationFrame
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width;  // 0 (left) to 1 (right)
      const mouseY = (e.clientY - rect.top) / rect.height; // 0 (top) to 1 (bottom)

      // Calculate tilt angles:
      // When mouse is top-left, tilt card up and left
      const rotateX = (0.5 - mouseY) * tiltLimit;
      const rotateY = (mouseX - 0.5) * tiltLimit * 1.2;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px) scale(1.015)`;

      // Dynamic specular reflection glare effect
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background = `radial-gradient(350px circle at ${(mouseX * 100).toFixed(1)}% ${(mouseY * 100).toFixed(1)}%, rgba(255, 255, 255, 0.15), transparent 60%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice.current) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const card = cardRef.current;
    if (card) {
      // Smoothly return to flat position
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform ${className}`}
      style={{
        // Hardware acceleration hint
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {children}

      {/* Glossy light glare reflection layer */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
