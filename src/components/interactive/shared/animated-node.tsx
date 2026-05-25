"use client";

import { motion } from "framer-motion";
import { statusColors, type StatusType } from "./theme";

interface AnimatedNodeProps {
  label?: string;
  status?: StatusType;
  size?: number;
  shape?: "circle" | "box";
  className?: string;
  onClick?: () => void;
  pulse?: boolean;
}

export function AnimatedNode({
  label,
  status = "neutral",
  size = 48,
  shape = "box",
  className = "",
  onClick,
  pulse = false,
}: AnimatedNodeProps) {
  const colors = statusColors[status];
  const isCircle = shape === "circle";

  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={`relative inline-flex items-center justify-center border-2 ${colors.border} ${colors.bg}/20 text-xs font-medium select-none
        ${isCircle ? "rounded-full" : "rounded-lg"}
        ${onClick ? "cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary" : ""}
        ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      animate={pulse ? { scale: [1, 1.08, 1] } : undefined}
      transition={pulse ? { duration: 1.5, repeat: Infinity } : undefined}
      layout
    >
      {label && (
        <span className="truncate px-1 text-foreground text-xs leading-tight text-center">
          {label}
        </span>
      )}
    </motion.div>
  );
}
