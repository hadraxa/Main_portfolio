"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_SKILLS, type SkillItem } from "@/lib/skillsData";

/**
 * =========================================================================
 * 🎨 3D SKILLS GLOBE CONFIGURATION
 * =========================================================================
 */
const GLOBE_CONFIG = {
  sphereRadiusDesktop: 165,
  sphereRadiusMobile: 120,

  autoRotateSpeedX: 0.0016,
  autoRotateSpeedY: 0.0007,
  dragSensitivity: 0.004,

  perspective: 330,
  minScale: 0.55,
  maxScale: 1.18,
  minOpacity: 0.25,
  maxOpacity: 1.0,
};

interface GlobeTag {
  id: string;
  text: string;
  category: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

interface SkillsGlobeProps {
  skills?: string[]; // Optional fallback
  activeCategory?: string;
  activeSkillId?: string | null;
  onSelectSkill?: (skill: SkillItem) => void;
  className?: string;
}

export default function SkillsGlobe({
  activeCategory = "all",
  activeSkillId = null,
  onSelectSkill,
  className = "",
}: SkillsGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTag, setHoveredTag] = useState<SkillItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Store refs so animation loop always has fresh state without re-creating listeners
  const activeCategoryRef = useRef(activeCategory);
  const activeSkillIdRef = useRef(activeSkillId);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    activeSkillIdRef.current = activeSkillId;
  }, [activeSkillId]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let isDragging = false;
    let dragDistance = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let velocityX = GLOBE_CONFIG.autoRotateSpeedX;
    let velocityY = GLOBE_CONFIG.autoRotateSpeedY;

    // Distribute skills evenly on a 3D sphere using the Fibonacci Golden Spiral formula
    const count = ALL_SKILLS.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    const tags: GlobeTag[] = ALL_SKILLS.map((skill, i) => {
      const y = 1 - (i / (count - 1 || 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      return {
        id: skill.id,
        text: skill.name,
        category: skill.category,
        color: skill.color,
        x: Math.cos(theta) * radiusAtY,
        y: y,
        z: Math.sin(theta) * radiusAtY,
      };
    });

    let width = 0;
    let height = 0;
    let radius = GLOBE_CONFIG.sphereRadiusDesktop;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      radius = width < 480 ? GLOBE_CONFIG.sphereRadiusMobile : GLOBE_CONFIG.sphereRadiusDesktop;
    };
    resize();
    window.addEventListener("resize", resize);

    // 3D Matrix Rotations
    const rotateY = (angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (const tag of tags) {
        const x1 = tag.x * cos - tag.z * sin;
        const z1 = tag.x * sin + tag.z * cos;
        tag.x = x1;
        tag.z = z1;
      }
    };

    const rotateX = (angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (const tag of tags) {
        const y1 = tag.y * cos - tag.z * sin;
        const z1 = tag.y * sin + tag.z * cos;
        tag.y = y1;
        tag.z = z1;
      }
    };

    // Pointer events
    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      dragDistance = 0;
      lastMouseX = clientX;
      lastMouseY = clientY;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - lastMouseX;
      const deltaY = clientY - lastMouseY;
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      velocityX = deltaX * GLOBE_CONFIG.dragSensitivity;
      velocityY = -deltaY * GLOBE_CONFIG.dragSensitivity;

      rotateY(velocityX);
      rotateX(velocityY);

      lastMouseX = clientX;
      lastMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPointerMove(e.clientX, e.clientY);
      } else {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        checkHover(mx, my);
      }
    };
    const handleMouseUp = () => {
      // If it was a quick click without dragging, check for tag selection
      if (dragDistance < 5 && currentHoverItem) {
        onSelectSkill?.(currentHoverItem);
      }
      onPointerUp();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => {
      if (dragDistance < 8 && currentHoverItem) {
        onSelectSkill?.(currentHoverItem);
      }
      onPointerUp();
    };

    let currentHoverId: string | null = null;
    let currentHoverItem: SkillItem | null = null;

    const checkHover = (mx: number, my: number) => {
      const cx = width / 2;
      const cy = height / 2;
      let foundSkill: SkillItem | null = null;

      for (const tag of tags) {
        if (tag.z <= -0.1) continue; // Only hover front hemisphere

        const k = GLOBE_CONFIG.perspective / (GLOBE_CONFIG.perspective - tag.z * radius);
        const screenX = cx + tag.x * radius * k;
        const screenY = cy + tag.y * radius * k;

        // Bounding box hit test
        if (Math.abs(mx - screenX) < 42 * k && Math.abs(my - screenY) < 16 * k) {
          const match = ALL_SKILLS.find((s) => s.id === tag.id);
          if (match) {
            foundSkill = match;
            break;
          }
        }
      }

      const foundId = foundSkill?.id ?? null;
      if (foundId !== currentHoverId) {
        currentHoverId = foundId;
        currentHoverItem = foundSkill;
        setHoveredTag(foundSkill);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Pause rendering when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Main 60 FPS Render Loop
    const render = () => {
      if (isVisible) {
        if (!isDragging && !isPausedRef.current) {
          velocityX += (GLOBE_CONFIG.autoRotateSpeedX - velocityX) * 0.05;
          velocityY += (GLOBE_CONFIG.autoRotateSpeedY - velocityY) * 0.05;

          // If a tag is hovered, pause auto-rotation so user can read smoothly
          if (!currentHoverId) {
            rotateY(velocityX);
            rotateX(velocityY);
          }
        }

        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        // Draw futuristic orbit ring
        ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.96, 0, Math.PI * 2);
        ctx.stroke();

        // Sort by Z depth
        const sortedTags = [...tags].sort((a, b) => a.z - b.z);

        const curCat = activeCategoryRef.current;
        const curSkillId = activeSkillIdRef.current;

        for (const tag of sortedTags) {
          const normalZ = (tag.z + 1) / 2;
          const scale = GLOBE_CONFIG.minScale + normalZ * (GLOBE_CONFIG.maxScale - GLOBE_CONFIG.minScale);
          let opacity = GLOBE_CONFIG.minOpacity + normalZ * (GLOBE_CONFIG.maxOpacity - GLOBE_CONFIG.minOpacity);

          // Category filter highlighting: dim non-matching skills
          const isCategoryMatch = curCat === "all" || tag.category === curCat;
          const isDirectSelect = curSkillId === tag.id;
          const isHovered = tag.id === currentHoverId;

          if (!isCategoryMatch && !isDirectSelect) {
            opacity *= 0.28;
          } else if (isCategoryMatch) {
            opacity = Math.min(1, opacity * 1.15);
          }

          if (isDirectSelect) {
            opacity = 1;
          }

          const k = GLOBE_CONFIG.perspective / (GLOBE_CONFIG.perspective - tag.z * radius);
          const screenX = cx + tag.x * radius * k;
          const screenY = cy + tag.y * radius * k;

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.scale(isDirectSelect ? scale * 1.15 : scale, isDirectSelect ? scale * 1.15 : scale);

          const fontSize = isHovered || isDirectSelect ? 13 : 11.5;
          ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
          const textWidth = ctx.measureText(tag.text).width;
          const pillWidth = textWidth + 22;
          const pillHeight = 26;

          // Pill Background
          if (isDirectSelect) {
            ctx.fillStyle = tag.color + "40";
            ctx.strokeStyle = tag.color;
            ctx.lineWidth = 2;
          } else if (isHovered) {
            ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
            ctx.strokeStyle = tag.color;
            ctx.lineWidth = 1.6;
          } else if (isCategoryMatch && curCat !== "all") {
            ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.65, opacity * 0.9)})`;
            ctx.strokeStyle = tag.color + "aa";
            ctx.lineWidth = 1.2;
          } else {
            ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.4, opacity * 0.85)})`;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
          }

          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 13);
          } else {
            ctx.rect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight);
          }
          ctx.fill();
          ctx.stroke();

          // Glow effect for selected or hovered
          if (isHovered || isDirectSelect) {
            ctx.shadowColor = tag.color;
            ctx.shadowBlur = 18;
          }

          // Text
          ctx.fillStyle = isHovered || isDirectSelect ? "#ffffff" : isCategoryMatch ? tag.color : "#94a3b8";
          ctx.globalAlpha = opacity;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(tag.text, 0, 1);

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      observer.disconnect();
    };
  }, [onSelectSkill]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Mini Controls Bar overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-md bg-black/60 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white backdrop-blur transition"
          title={isPaused ? "Resume rotation" : "Pause rotation"}
        >
          {isPaused ? "▶ Play" : "⏸ Pause"}
        </button>
      </div>

      {/* Floating Info Tooltip on Hover */}
      {hoveredTag && (
        <div className="absolute bottom-4 inset-x-0 mx-auto max-w-xs text-center pointer-events-none px-3 z-10">
          <div className="inline-flex items-center gap-2 rounded-xl bg-black/80 border border-fuchsia-500/40 px-3.5 py-1.5 shadow-xl shadow-fuchsia-500/10 backdrop-blur">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredTag.color }}
            />
            <span className="text-xs font-semibold text-white">{hoveredTag.name}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[11px] text-fuchsia-300 font-mono">{hoveredTag.experience}</span>
          </div>
        </div>
      )}
    </div>
  );
}
