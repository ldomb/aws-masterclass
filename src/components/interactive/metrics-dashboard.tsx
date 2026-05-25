"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { useSimulation } from "./shared/use-simulation";

type Scenario = "normal" | "high-load" | "degradation" | "outage";

interface MetricConfig {
  name: string;
  unit: string;
  threshold?: number;
  generate: (scenario: Scenario) => number;
  format: (v: number) => string;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const metrics: MetricConfig[] = [
  {
    name: "Latency",
    unit: "ms",
    threshold: 500,
    format: (v) => v.toFixed(0),
    generate: (s) => {
      switch (s) {
        case "normal": return rand(80, 200);
        case "high-load": return rand(300, 600);
        case "degradation": return rand(400, 900);
        case "outage": return rand(1500, 5000);
      }
    },
  },
  {
    name: "Error Rate",
    unit: "%",
    threshold: 5,
    format: (v) => v.toFixed(1),
    generate: (s) => {
      switch (s) {
        case "normal": return rand(0.1, 2);
        case "high-load": return rand(1, 4);
        case "degradation": return rand(8, 25);
        case "outage": return rand(40, 80);
      }
    },
  },
  {
    name: "Request Rate",
    unit: "req/s",
    format: (v) => v.toFixed(0),
    generate: (s) => {
      switch (s) {
        case "normal": return rand(200, 500);
        case "high-load": return rand(800, 2000);
        case "degradation": return rand(100, 400);
        case "outage": return rand(10, 60);
      }
    },
  },
  {
    name: "CPU",
    unit: "%",
    threshold: 80,
    format: (v) => v.toFixed(0),
    generate: (s) => {
      switch (s) {
        case "normal": return rand(20, 50);
        case "high-load": return rand(70, 95);
        case "degradation": return rand(60, 85);
        case "outage": return rand(95, 100);
      }
    },
  },
];

const MAX_POINTS = 30;

const scenarioLabels: { key: Scenario; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "high-load", label: "High Load" },
  { key: "degradation", label: "Degradation" },
  { key: "outage", label: "Outage" },
];

function Sparkline({
  data,
  threshold,
  isAlert,
  name,
}: {
  data: number[];
  threshold?: number;
  isAlert: boolean;
  name: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data, threshold ?? Infinity) * 0.8;
  const max = Math.max(...data, threshold ?? -Infinity) * 1.2 || 1;
  const w = 200;
  const h = 50;

  const toY = (v: number) => h - ((v - min) / (max - min)) * h;
  const points = data
    .map((v, i) => `${(i / (MAX_POINTS - 1)) * w},${toY(v)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-10 mt-1"
      preserveAspectRatio="none"
      aria-hidden="true"
      role="img"
      aria-label={`${name} sparkline chart`}
    >
      {threshold !== undefined && (
        <line
          x1={0}
          y1={toY(threshold)}
          x2={w}
          y2={toY(threshold)}
          stroke="currentColor"
          className="text-red-600 dark:text-red-400"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          strokeOpacity={0.8}
        />
      )}
      <polyline
        fill="none"
        stroke="currentColor"
        className={isAlert ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}
        strokeWidth={1.5}
        points={points}
      />
    </svg>
  );
}

export function MetricsDashboard() {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [history, setHistory] = useState<number[][]>(() =>
    metrics.map(() => [])
  );
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  const onTick = useCallback(() => {
    setHistory((prev) =>
      prev.map((arr, i) => {
        const next = [...arr, metrics[i].generate(scenarioRef.current)];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      })
    );
  }, []);

  const sim = useSimulation({ intervalMs: 1000, onTick });

  const handleReset = useCallback(() => {
    sim.reset();
    setHistory(metrics.map(() => []));
  }, [sim]);

  const started = useRef(false);
  if (!started.current) {
    started.current = true;
    setTimeout(() => sim.start(), 0);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Metrics Dashboard
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const data = history[i];
          const current = data[data.length - 1];
          const isAlert =
            metric.threshold !== undefined &&
            current !== undefined &&
            current > metric.threshold;

          return (
            <div
              key={metric.name}
              className={`rounded-lg border p-3 transition-colors ${
                isAlert
                  ? "border-red-500 bg-red-500/10 dark:bg-red-950/40"
                  : "border-border bg-card"
              }`}
              role={isAlert ? "alert" : undefined}
              aria-label={`${metric.name}: ${current !== undefined ? metric.format(current) : "—"} ${metric.unit}${isAlert ? " — ALERT: above threshold" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {metric.name}
                </span>
                {isAlert && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    ⚠ ALERT
                  </Badge>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current?.toFixed(1)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className={`text-2xl font-mono font-bold mt-1 ${
                    isAlert ? "text-red-700 dark:text-red-400" : "text-foreground"
                  }`}
                >
                  {current !== undefined ? metric.format(current) : "—"}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </motion.div>
              </AnimatePresence>
              <Sparkline data={data} threshold={metric.threshold} isAlert={isAlert} name={metric.name} />
              {metric.threshold !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  Threshold: {metric.threshold} {metric.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ControlPanel
        isRunning={sim.isRunning}
        onToggle={sim.toggle}
        onReset={handleReset}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {scenarioLabels.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={scenario === key ? "default" : "outline"}
              onClick={() => setScenario(key)}
              className="h-8 text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
        <SliderControl
          label="Speed"
          value={sim.speed}
          min={0.5}
          max={5}
          step={0.5}
          onChange={sim.setSpeed}
          unit="x"
        />
      </ControlPanel>
    </div>
  );
}
