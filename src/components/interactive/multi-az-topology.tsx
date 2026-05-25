"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { useSimulation } from "./shared/use-simulation";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Globe, X } from "lucide-react";

interface AZState {
  id: string;
  label: string;
  failed: boolean;
}

const INITIAL_AZS: AZState[] = [
  { id: "az-1", label: "AZ-1 (us-east-1a)", failed: false },
  { id: "az-2", label: "AZ-2 (us-east-1b)", failed: false },
  { id: "az-3", label: "AZ-3 (us-east-1c)", failed: false },
];

interface TrafficDot {
  id: number;
  azIndex: number;
  progress: number;
  serverIndex: number;
}

export function MultiAZTopology() {
  const [azs, setAzs] = useState<AZState[]>(INITIAL_AZS);
  const [trafficVolume, setTrafficVolume] = useState(50);
  const [dots, setDots] = useState<TrafficDot[]>([]);
  const [dotCounter, setDotCounter] = useState(0);

  const activeAzs = useMemo(() => azs.filter((az) => !az.failed), [azs]);
  const activeCount = activeAzs.length;

  const loadPerAz = useMemo(() => {
    if (activeCount === 0) return 0;
    return Math.round((trafficVolume / activeCount) * (3 / 100));
  }, [trafficVolume, activeCount]);

  const capacityPercent = useMemo(() => {
    if (activeCount === 0) return 100;
    return Math.round(100 / activeCount * (trafficVolume / 100));
  }, [activeCount, trafficVolume]);

  const handleTick = useCallback(() => {
    setDots((prev) => {
      const moved = prev
        .map((d) => ({ ...d, progress: d.progress + 0.15 }))
        .filter((d) => d.progress <= 1.2);
      return moved;
    });

    setAzs((currentAzs) => {
      const active = currentAzs
        .map((az, i) => ({ az, i }))
        .filter((x) => !x.az.failed);

      if (active.length === 0) return currentAzs;

      const spawnChance = trafficVolume / 100;
      if (Math.random() < spawnChance) {
        const target = active[Math.floor(Math.random() * active.length)];
        setDotCounter((c) => {
          const newId = c + 1;
          setDots((prev) => [
            ...prev,
            {
              id: newId,
              azIndex: target.i,
              progress: 0,
              serverIndex: Math.random() > 0.5 ? 1 : 0,
            },
          ]);
          return newId;
        });
      }

      return currentAzs;
    });
  }, [trafficVolume]);

  const sim = useSimulation({ intervalMs: 150, onTick: handleTick });

  const toggleAz = useCallback(
    (index: number) => {
      setAzs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], failed: !next[index].failed };
        return next;
      });
      setDots((prev) => prev.filter((d) => d.azIndex !== index || !azs[index].failed === false));
    },
    [azs],
  );

  const handleReset = useCallback(() => {
    sim.reset();
    setAzs(INITIAL_AZS);
    setDots([]);
    setDotCounter(0);
  }, [sim]);

  const warningThreshold = capacityPercent > 80;
  const criticalThreshold = activeCount === 0;

  const capacityColor = criticalThreshold
    ? "text-red-700 dark:text-red-400"
    : warningThreshold
      ? "text-amber-700 dark:text-amber-400"
      : "text-emerald-700 dark:text-emerald-500";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Multi-AZ Architecture Topology
      </h3>

      <ControlPanel
        isRunning={sim.isRunning}
        onToggle={sim.toggle}
        onReset={handleReset}
      >
        <SliderControl
          label="Traffic"
          value={trafficVolume}
          min={10}
          max={100}
          step={10}
          onChange={setTrafficVolume}
          unit="%"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Active AZs: {activeCount}/3</span>
          <span>|</span>
          <span>
            Load per AZ:{" "}
            <span className={`font-semibold ${capacityColor}`}>
              {activeCount === 0 ? "N/A" : `${capacityPercent}%`}
            </span>
          </span>
        </div>
        {warningThreshold && !criticalThreshold && (
          <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400 text-xs">
            ⚠ High load warning
          </Badge>
        )}
        {criticalThreshold && (
          <Badge variant="destructive" className="text-xs">
            ✕ All AZs down!
          </Badge>
        )}
      </ControlPanel>

      {/* Topology diagram */}
      <div className="mt-4 relative">
        {/* Global Load Balancer label */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <Globe className="h-3 w-3" aria-hidden="true" />
            <span>Global Load Balancer</span>
          </div>
        </div>

        {/* AZ columns — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {azs.map((az, i) => (
            <motion.div
              key={az.id}
              className={`relative rounded-lg border-2 p-3 cursor-pointer transition-colors select-none ${
                az.failed
                  ? "border-red-500 bg-red-500/20 dark:bg-red-950/40"
                  : "border-border bg-muted/20 hover:border-primary/50"
              }`}
              onClick={() => toggleAz(i)}
              animate={{ opacity: az.failed ? 0.7 : 1 }}
              transition={{ duration: 0.3 }}
              role="button"
              aria-pressed={az.failed}
              aria-label={`${az.label} — ${az.failed ? "failed, click to restore" : "healthy, click to fail"}`}
            >
              {/* Failure overlay */}
              <AnimatePresence>
                {az.failed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    aria-hidden="true"
                  >
                    <X className="h-16 w-16 text-red-500/60" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AZ label */}
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center truncate">
                {az.label}
              </div>

              {/* Load Balancer */}
              <div className="flex justify-center mb-2">
                <div
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                    az.failed
                      ? "bg-red-500/10 text-red-700 dark:text-red-400"
                      : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  <span>ALB</span>
                </div>
              </div>

              {/* App Servers */}
              <div className="flex gap-1.5 justify-center mb-2">
                {[0, 1].map((si) => (
                  <div
                    key={si}
                    className={`flex flex-col items-center gap-0.5 rounded px-1.5 py-1 text-xs ${
                      az.failed
                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    <Server className="h-3 w-3" aria-hidden="true" />
                    <span>App {si + 1}</span>
                  </div>
                ))}
              </div>

              {/* Database */}
              <div className="flex justify-center mb-2">
                <div
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                    az.failed
                      ? "bg-red-500/10 text-red-700 dark:text-red-400"
                      : "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                  }`}
                >
                  <Database className="h-3 w-3" aria-hidden="true" />
                  <span>DB Replica</span>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mt-1">
                <div
                  className="h-2 bg-muted rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={az.failed ? 0 : capacityPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={az.failed ? "AZ down" : `Capacity: ${capacityPercent}%`}
                >
                  <motion.div
                    className={`h-full rounded-full ${
                      az.failed
                        ? "bg-red-500/50"
                        : capacityPercent > 80
                          ? "bg-amber-600 dark:bg-amber-500"
                          : "bg-emerald-600 dark:bg-emerald-500"
                    }`}
                    animate={{
                      width: az.failed ? "0%" : `${Math.min(capacityPercent, 100)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-0.5">
                  {az.failed ? "DOWN" : `${capacityPercent}% load`}
                </div>
              </div>

              {/* Traffic dots */}
              <AnimatePresence>
                {dots
                  .filter((d) => d.azIndex === i)
                  .map((dot) => {
                    const yPos = dot.progress * 100;
                    const xOffset = dot.serverIndex === 0 ? 35 : 65;
                    return (
                      <motion.div
                        key={dot.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400 z-20"
                        style={{
                          top: `${Math.min(yPos, 95)}%`,
                          left: `${xOffset}%`,
                        }}
                        aria-hidden="true"
                      />
                    );
                  })}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="mt-3 text-xs text-muted-foreground">
        Click an AZ to simulate failure. Click again to restore. Watch traffic redistribute across remaining zones.
      </p>
    </div>
  );
}
