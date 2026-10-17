"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

/**
 * 3D hover tilt with a soft moving glare. Transform-only (GPU friendly); does nothing on touch devices,
 * and Framer's reducedMotion setting turns the rotation off for visitors who ask for less motion.
 */
export function Tilt({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0), ry = useMotionValue(0), gx = useMotionValue(50), gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.08), transparent 45%)`;

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set((0.5 - py) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={`[perspective:1100px] ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <motion.div className="relative h-full" style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}>
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[26px]" style={{ background: glare }} />
      </motion.div>
    </div>
  );
}
