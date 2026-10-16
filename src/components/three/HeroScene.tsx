"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * =========================================================================
 * 🎨 HERO 3D SETTINGS — Easily change colors, speeds, and sizes here!
 * =========================================================================
 */
export const HERO_CONFIG = {
  // Core Glowing Crystal
  coreColor: "#8b5cf6", // Purple glow
  coreEmissive: "#5b21b6",
  coreRoughness: 0.2,
  coreMetalness: 0.8,

  // Outer Wireframe Gyroscope Rings
  innerWireframeColor: "#22d3ee", // Cyan
  outerWireframeColor: "#f472b6", // Pink
  outerRingColor: "#38bdf8", // Sky blue

  // Orbiting Satellites (Tech nodes)
  satelliteColors: ["#f472b6", "#22d3ee", "#fbbf24", "#34d399", "#a855f7"],

  // Animation Speeds
  idleSpinSpeed: 0.35,
  mouseParallaxStrength: 0.45,
};

/**
 * 1. The central glowing crystal orb with an inner wireframe cage.
 */
function CentralCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerCageRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2 * HERO_CONFIG.idleSpinSpeed;
      meshRef.current.rotation.y += delta * 0.3 * HERO_CONFIG.idleSpinSpeed;
    }
    if (innerCageRef.current) {
      innerCageRef.current.rotation.x -= delta * 0.25 * HERO_CONFIG.idleSpinSpeed;
      innerCageRef.current.rotation.z += delta * 0.2 * HERO_CONFIG.idleSpinSpeed;
    }
  });

  return (
    <group>
      {/* Solid facet core with metallic sheen */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color={HERO_CONFIG.coreColor}
          emissive={HERO_CONFIG.coreEmissive}
          emissiveIntensity={0.8}
          roughness={HERO_CONFIG.coreRoughness}
          metalness={HERO_CONFIG.coreMetalness}
        />
      </mesh>

      {/* Futuristic wireframe cage */}
      <mesh ref={innerCageRef} scale={1.45}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial
          color={HERO_CONFIG.innerWireframeColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

/**
 * 2. Planetary gyroscope rings that rotate around the central core.
 */
function GyroscopeRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.4 * HERO_CONFIG.idleSpinSpeed;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.3 * HERO_CONFIG.idleSpinSpeed;
  });

  return (
    <group rotation={[1.1, 0.4, 0]}>
      {/* Inner Pink Ring */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.3, 0.015, 16, 80]} />
        <meshBasicMaterial color={HERO_CONFIG.outerWireframeColor} transparent opacity={0.8} />
      </mesh>

      {/* Outer Cyan Ring */}
      <mesh ref={ring2} rotation={[0.6, 0.4, 0]}>
        <torusGeometry args={[2.75, 0.012, 16, 80]} />
        <meshBasicMaterial color={HERO_CONFIG.outerRingColor} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

/**
 * 3. Orbiting tech satellites (beacons of light orbiting in 3D).
 */
function OrbitingSatellites() {
  const satellites = useMemo(() => {
    return HERO_CONFIG.satelliteColors.map((color, index) => ({
      color,
      radius: 2.2 + (index % 3) * 0.35,
      speed: 0.35 + index * 0.08,
      offsetAngle: (index / HERO_CONFIG.satelliteColors.length) * Math.PI * 2,
      tilt: (index % 2 === 0 ? 1 : -1) * (0.35 + index * 0.1),
      size: 0.11 + (index % 2) * 0.04,
    }));
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    satellites.forEach((sat, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const angle = elapsed * sat.speed + sat.offsetAngle;
      mesh.position.x = Math.cos(angle) * sat.radius;
      mesh.position.z = Math.sin(angle) * sat.radius;
      mesh.position.y = Math.sin(angle * 1.5) * sat.tilt;
    });
  });

  return (
    <group>
      {satellites.map((sat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[sat.size, 16, 16]} />
          <meshStandardMaterial
            color={sat.color}
            emissive={sat.color}
            emissiveIntensity={1.5}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 4. Camera & Mouse Rig — softly tilts the scene based on cursor position.
 */
function SmoothMouseRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouseCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1 .. +1 across the window
      mouseCoords.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoords.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleWindowMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Target tilt based on normalized mouse coordinates
    const targetX = -mouseCoords.current.y * HERO_CONFIG.mouseParallaxStrength * 0.45;
    const targetY = mouseCoords.current.x * HERO_CONFIG.mouseParallaxStrength * 0.7;

    // Smooth damping (lerp) prevents sudden jumps
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      3.5,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      3.5,
      delta
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * Main 3D Hero Scene component.
 * Features:
 * - IntersectionObserver to PAUSE rendering when scrolled past hero (zero lag).
 * - Capped DPR (1 to 1.5) for silky 60fps on Retina and 4K displays.
 * - Optimized geometry (low poly count with sleek lighting).
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  // Pause rendering when user scrolls away from hero section
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 48 }}
        // Cap pixel ratio to 1.5 max for butter-smooth framerate
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
        // Pause canvas when out of view to save 100% of GPU resources
        frameloop={isInView ? "always" : "never"}
      >
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 4, 5]} intensity={45} color="#c084fc" />
        <pointLight position={[-5, -3, 3]} intensity={40} color="#22d3ee" />
        <pointLight position={[0, 5, -4]} intensity={25} color="#f472b6" />

        {/* Subtle, lightweight twinkling starfield */}
        <Stars radius={50} depth={30} count={600} factor={2.5} saturation={0} fade speed={0.8} />

        {/* 3D Model with mouse tilt */}
        <SmoothMouseRig>
          <group position={[1.5, 0, 0]}>
            <CentralCore />
            <GyroscopeRings />
            <OrbitingSatellites />
          </group>
        </SmoothMouseRig>
      </Canvas>
    </div>
  );
}
