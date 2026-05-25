"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { useSimulation } from "./shared/use-simulation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CircuitState = "closed" | "open" | "half-open";

interface RequestDot {
  id: number;
  success: boolean;
  rejected: boolean;
}

interface Stats {
  total: number;
  successes: number;
  failures: number;
  rejected: number;
}

export function CircuitBreakerDemo() {
  const [circuitState, setCircuitState] = useState<CircuitState>("closed");
  const [failureCount, setFailureCount] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, successes: 0, failures: 0, rejected: 0 });
  const [dots, setDots] = useState<RequestDot[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const [threshold, setThreshold] = useState(5);
  const [cooldownTimeout, setCooldownTimeout] = useState(5);
  const [failureProbability, setFailureProbability] = useState(50);

  const dotIdRef = useRef(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(circuitState);
  stateRef.current = circuitState;
  const failureCountRef = useRef(failureCount);
  failureCountRef.current = failureCount;
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;
  const cooldownTimeoutRef = useRef(cooldownTimeout);
  cooldownTimeoutRef.current = cooldownTimeout;
  const failureProbabilityRef = useRef(failureProbability);
  failureProbabilityRef.current = failureProbability;
  const cooldownRemainingRef = useRef(cooldownRemaining);
  cooldownRemainingRef.current = cooldownRemaining;

  const startCooldown = useCallback(() => {
    setCooldownRemaining(cooldownTimeoutRef.current);
    cooldownRemainingRef.current = cooldownTimeoutRef.current;
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      cooldownRemainingRef.current -= 1;
      setCooldownRemaining(cooldownRemainingRef.current);
      if (cooldownRemainingRef.current <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = null;
        setCircuitState("half-open");
        stateRef.current = "half-open";
      }
    }, 1000);
  }, []);

  const processRequest = useCallback(() => {
    const state = stateRef.current;
    const id = ++dotIdRef.current;

    if (state === "open") {
      const dot: RequestDot = { id, success: false, rejected: true };
      setDots((d) => [...d.slice(-15), dot]);
      setStats((s) => ({ ...s, total: s.total + 1, rejected: s.rejected + 1 }));
      return;
    }

    const success = Math.random() * 100 >= failureProbabilityRef.current;
    const dot: RequestDot = { id, success, rejected: false };
    setDots((d) => [...d.slice(-15), dot]);

    if (success) {
      setStats((s) => ({ ...s, total: s.total + 1, successes: s.successes + 1 }));
      if (state === "half-open") {
        setCircuitState("closed");
        stateRef.current = "closed";
        setFailureCount(0);
        failureCountRef.current = 0;
      }
    } else {
      setStats((s) => ({ ...s, total: s.total + 1, failures: s.failures + 1 }));
      if (state === "half-open") {
        setCircuitState("open");
        stateRef.current = "open";
        startCooldown();
      } else {
        const newCount = failureCountRef.current + 1;
        setFailureCount(newCount);
        failureCountRef.current = newCount;
        if (newCount >= thresholdRef.current) {
          setCircuitState("open");
          stateRef.current = "open";
          startCooldown();
        }
      }
    }
  }, [startCooldown]);

  const sim = useSimulation({ intervalMs: 800, onTick: processRequest });

  const handleReset = useCallback(() => {
    sim.reset();
    setCircuitState("closed");
    stateRef.current = "closed";
    setFailureCount(0);
    failureCountRef.current = 0;
    setStats({ total: 0, successes: 0, failures: 0, rejected: 0 });
    setDots([]);
    setCooldownRemaining(0);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  }, [sim]);

  const stateConfig = {
    closed: {
      color: "bg-emerald-500",
      border: "border-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "CLOSED",
      description: "Requests flowing normally",
    },
    open: {
      color: "bg-red-500",
      border: "border-red-500",
      text: "text-red-700 dark:text-red-400",
      label: "OPEN",
      description: "Requests rejected",
    },
    "half-open": {
      color: "bg-amber-500",
      border: "border-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      label: "HALF-OPEN",
      description: "Sending trial request",
    },
  };

  const states: CircuitState[] = ["closed", "open", "half-open"];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Circuit Breaker Pattern</h3>

      {/* State Machine Visualization */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
          {states.map((s) => {
            const cfg = stateConfig[s];
            const active = circuitState === s;
            return (
              <motion.div
                key={s}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 ${
                  active ? cfg.border : "border-muted"
                } ${active ? `${cfg.color}/20` : "bg-muted/10"} transition-colors`}
                animate={{
                  width: active ? 120 : 90,
                  height: active ? 120 : 90,
                  scale: active ? 1 : 0.85,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                aria-current={active ? "true" : undefined}
              >
                <div
                  className={`w-4 h-4 rounded-full ${active ? cfg.color : "bg-muted"} mb-1`}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs font-bold ${active ? cfg.text : "text-muted-foreground"}`}
                >
                  {cfg.label}
                </span>
                {active && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 text-center px-1">
                    {cfg.description}
                  </span>
                )}
                {s === "open" && circuitState === "open" && cooldownRemaining > 0 && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {cooldownRemaining}s
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Transition arrows */}
        <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground flex-wrap">
          <span>failures &ge; threshold &rarr; OPEN</span>
          <span>cooldown &rarr; HALF-OPEN</span>
          <span>trial ok &rarr; CLOSED</span>
        </div>
      </div>

      {/* Failure Counter */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Failure Counter</span>
          <span className="font-mono text-sm">
            {failureCount} / {threshold}
          </span>
        </div>
        <div
          className="h-3 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={failureCount}
          aria-valuemin={0}
          aria-valuemax={threshold}
          aria-label={`Failure counter: ${failureCount} of ${threshold}`}
        >
          <motion.div
            className={`h-full rounded-full ${
              failureCount >= threshold ? "bg-red-600 dark:bg-red-500" : "bg-amber-600 dark:bg-amber-500"
            }`}
            animate={{ width: `${Math.min((failureCount / threshold) * 100, 100)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>

      {/* Request Flow */}
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground mb-2">Request Flow</div>
        <div className="flex gap-1.5 flex-wrap min-h-[32px]">
          <AnimatePresence mode="popLayout">
            {dots.map((dot) => (
              <motion.div
                key={dot.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                title={dot.rejected ? "Rejected" : dot.success ? "Success" : "Failure"}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  dot.rejected
                    ? "bg-gray-500"
                    : dot.success
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : "bg-red-600 dark:bg-red-500"
                }`}
                aria-label={dot.rejected ? "Rejected request" : dot.success ? "Successful request" : "Failed request"}
              >
                {dot.rejected ? "—" : dot.success ? "✓" : "✕"}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 dark:bg-emerald-500 inline-block" aria-hidden="true" />
            Success (✓)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 dark:bg-red-500 inline-block" aria-hidden="true" />
            Failure (✕)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-500 inline-block" aria-hidden="true" />
            Rejected (—)
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, variant: "outline" as const },
          { label: "Success", value: stats.successes, variant: "default" as const },
          { label: "Failures", value: stats.failures, variant: "destructive" as const },
          { label: "Rejected", value: stats.rejected, variant: "secondary" as const },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <ControlPanel isRunning={sim.isRunning} onToggle={sim.toggle} onReset={handleReset}>
        <Button
          size="sm"
          variant="outline"
          onClick={processRequest}
          disabled={sim.isRunning}
          className="h-9 text-xs"
        >
          Send Request
        </Button>
        <SliderControl label="Threshold" value={threshold} min={3} max={10} onChange={setThreshold} />
        <SliderControl
          label="Cooldown"
          value={cooldownTimeout}
          min={2}
          max={10}
          onChange={setCooldownTimeout}
          unit="s"
        />
        <SliderControl
          label="Fail %"
          value={failureProbability}
          min={0}
          max={100}
          step={5}
          onChange={setFailureProbability}
          unit="%"
        />
      </ControlPanel>
    </div>
  );
}
