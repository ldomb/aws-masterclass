"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ControlPanel, SliderControl } from "./shared/control-panel";

const NINES_TABLE = [
  { label: "90%", value: 0.9, downtimeYear: "36.5 days", downtimeMonth: "3 days", downtimeWeek: "16.8 hrs" },
  { label: "99%", value: 0.99, downtimeYear: "3.65 days", downtimeMonth: "7.3 hrs", downtimeWeek: "1.68 hrs" },
  { label: "99.9%", value: 0.999, downtimeYear: "8.76 hrs", downtimeMonth: "43.8 min", downtimeWeek: "10.1 min" },
  { label: "99.99%", value: 0.9999, downtimeYear: "52.6 min", downtimeMonth: "4.38 min", downtimeWeek: "1.01 min" },
  { label: "99.999%", value: 0.99999, downtimeYear: "5.26 min", downtimeMonth: "26.3 sec", downtimeWeek: "6.05 sec" },
];

function getAvailabilityColor(pct: number): string {
  if (pct >= 99.9) return "text-green-700 dark:text-green-400";
  if (pct >= 99) return "text-yellow-700 dark:text-yellow-400";
  return "text-red-700 dark:text-red-400";
}

function getAvailabilityBg(pct: number): string {
  if (pct >= 99.9) return "bg-green-500/10 border-green-500/60";
  if (pct >= 99) return "bg-yellow-500/10 border-yellow-500/60";
  return "bg-red-500/10 border-red-500/60";
}

function closestNinesIndex(availability: number): number {
  let closest = 0;
  let minDiff = Math.abs(availability - NINES_TABLE[0].value);
  for (let i = 1; i < NINES_TABLE.length; i++) {
    const diff = Math.abs(availability - NINES_TABLE[i].value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

function AnimatedNumber({ value, decimals = 4 }: { value: number; decimals?: number }) {
  return (
    <motion.span
      key={value.toFixed(decimals)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="font-mono"
    >
      {value.toFixed(decimals)}%
    </motion.span>
  );
}

function ServiceBox({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`rounded border px-3 py-2 text-xs font-mono text-center ${className ?? "bg-blue-500/10 border-blue-500/30 dark:bg-blue-400/10 dark:border-blue-400/30"}`}>
      {label}
    </div>
  );
}

export function AvailabilityCalculator() {
  const [mtbf, setMtbf] = useState(720);
  const [mttr, setMttr] = useState(1);
  const [a1, setA1] = useState(99.9);
  const [a2, setA2] = useState(99.9);

  const availability = useMemo(() => mtbf / (mtbf + mttr), [mtbf, mttr]);
  const availPct = availability * 100;
  const closestIdx = closestNinesIndex(availability);

  const serial = useMemo(() => (a1 / 100) * (a2 / 100) * 100, [a1, a2]);
  const parallel = useMemo(() => (1 - (1 - a1 / 100) * (1 - a2 / 100)) * 100, [a1, a2]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">Availability Calculator</h3>

      {/* MTBF / MTTR Section */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Availability = MTBF / (MTBF + MTTR)
        </p>
        <ControlPanel showPlayback={false}>
          <SliderControl label="MTBF" value={mtbf} min={1} max={8760} step={1} onChange={setMtbf} unit="h" />
          <SliderControl label="MTTR" value={mttr} min={0.1} max={24} step={0.1} onChange={setMttr} unit="h" />
        </ControlPanel>

        <div className={`rounded-lg border p-4 text-center ${getAvailabilityBg(availPct)}`}>
          <div className="text-sm text-muted-foreground mb-1">Calculated Availability</div>
          <div className={`text-2xl font-bold ${getAvailabilityColor(availPct)}`}>
            <AnimatedNumber value={availPct} />
          </div>
        </div>
      </div>

      {/* Nines Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4">Availability</th>
              <th className="py-2 pr-4">Downtime/Year</th>
              <th className="py-2 pr-4">Downtime/Month</th>
              <th className="py-2">Downtime/Week</th>
            </tr>
          </thead>
          <tbody>
            {NINES_TABLE.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b transition-colors ${
                  i === closestIdx
                    ? "bg-primary/10 dark:bg-primary/20 font-semibold"
                    : i % 2 === 0 ? "bg-muted/30" : ""
                }`}
              >
                <td className="py-2 pr-4 font-mono">
                  {row.label}
                  {i === closestIdx && (
                    <Badge variant="outline" className="ml-2 text-[10px]">current</Badge>
                  )}
                </td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">{row.downtimeYear}</td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">{row.downtimeMonth}</td>
                <td className="py-2 font-mono text-muted-foreground">{row.downtimeWeek}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Serial vs Parallel */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold dark:text-white">Serial vs Parallel Availability</h4>
        <ControlPanel showPlayback={false}>
          <SliderControl label="Service A" value={a1} min={90} max={99.99} step={0.01} onChange={setA1} unit="%" />
          <SliderControl label="Service B" value={a2} min={90} max={99.99} step={0.01} onChange={setA2} unit="%" />
        </ControlPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Serial */}
          <div className="rounded-lg border p-4 space-y-3 dark:border-neutral-700">
            <div className="text-sm font-medium dark:text-white">Serial (chain)</div>
            <div className="flex items-center gap-2 justify-center">
              <ServiceBox label={`A: ${a1}%`} />
              <span className="text-muted-foreground text-xs">→</span>
              <ServiceBox label={`B: ${a2}%`} />
            </div>
            <div className="text-xs text-muted-foreground text-center">A1 × A2</div>
            <div className={`text-center text-lg font-bold ${getAvailabilityColor(serial)}`}>
              <AnimatedNumber value={serial} />
            </div>
          </div>

          {/* Parallel */}
          <div className="rounded-lg border p-4 space-y-3 dark:border-neutral-700">
            <div className="text-sm font-medium dark:text-white">Parallel (redundant)</div>
            <div className="flex flex-col items-center gap-1 justify-center">
              <ServiceBox label={`A: ${a1}%`} />
              <span className="text-xs text-muted-foreground">||</span>
              <ServiceBox label={`B: ${a2}%`} />
            </div>
            <div className="text-xs text-muted-foreground text-center">1 - (1-A1)(1-A2)</div>
            <div className={`text-center text-lg font-bold ${getAvailabilityColor(parallel)}`}>
              <AnimatedNumber value={parallel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
