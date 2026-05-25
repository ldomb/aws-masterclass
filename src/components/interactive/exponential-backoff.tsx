"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { statusColors } from "./shared/theme";
import { useSimulation } from "./shared/use-simulation";
import { Button } from "@/components/ui/button";

type JitterStrategy = "none" | "full" | "equal";

const CLIENT_COUNT = 5;
const CLIENT_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#d97706", "#16a34a"];

function computeRetryTime(
  attempt: number,
  baseDelay: number,
  strategy: JitterStrategy,
  clientSeed: number,
): number {
  const cap = baseDelay * Math.pow(2, attempt);
  const rand = seededRandom(clientSeed * 100 + attempt);

  switch (strategy) {
    case "none":
      return cap;
    case "full":
      return rand * cap;
    case "equal":
      return cap / 2 + (rand * cap) / 2;
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function computeTimeline(
  retries: number,
  baseDelay: number,
  strategy: JitterStrategy,
): { clientId: number; times: number[] }[] {
  const clients: { clientId: number; times: number[] }[] = [];
  for (let c = 0; c < CLIENT_COUNT; c++) {
    const times: number[] = [];
    for (let r = 0; r < retries; r++) {
      times.push(computeRetryTime(r, baseDelay, strategy, c));
    }
    clients.push({ clientId: c, times });
  }
  return clients;
}

export function ExponentialBackoffVisualizer() {
  const [retries, setRetries] = useState(5);
  const [baseDelay, setBaseDelay] = useState(500);
  const [strategy, setStrategy] = useState<JitterStrategy>("none");
  const [revealedAttempt, setRevealedAttempt] = useState(-1);

  const timeline = useMemo(
    () => computeTimeline(retries, baseDelay, strategy),
    [retries, baseDelay, strategy],
  );

  const maxTime = useMemo(() => {
    let max = 0;
    for (const client of timeline) {
      for (const t of client.times) {
        if (t > max) max = t;
      }
    }
    return max || 1;
  }, [timeline]);

  const handleTick = useCallback(() => {
    setRevealedAttempt((prev) => prev + 1);
  }, []);

  const sim = useSimulation({ intervalMs: 600, onTick: handleTick });

  const handleToggle = useCallback(() => {
    if (!sim.isRunning && revealedAttempt >= retries - 1) {
      setRevealedAttempt(-1);
      setTimeout(() => sim.start(), 50);
    } else {
      sim.toggle();
    }
  }, [sim, revealedAttempt, retries]);

  const handleReset = useCallback(() => {
    sim.reset();
    setRevealedAttempt(-1);
  }, [sim]);

  if (sim.isRunning && revealedAttempt >= retries - 1) {
    sim.stop();
  }

  const strategies: { value: JitterStrategy; label: string }[] = [
    { value: "none", label: "No Jitter" },
    { value: "full", label: "Full Jitter" },
    { value: "equal", label: "Equal Jitter" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Exponential Backoff & Jitter
      </h3>

      <ControlPanel
        isRunning={sim.isRunning}
        onToggle={handleToggle}
        onReset={handleReset}
      >
        <SliderControl
          label="Retries"
          value={retries}
          min={1}
          max={8}
          onChange={(v) => {
            setRetries(v);
            handleReset();
          }}
        />
        <SliderControl
          label="Base delay"
          value={baseDelay}
          min={100}
          max={2000}
          step={100}
          onChange={(v) => {
            setBaseDelay(v);
            handleReset();
          }}
          unit="ms"
        />
        <div className="flex items-center gap-1">
          {strategies.map((s) => (
            <Button
              key={s.value}
              size="sm"
              variant={strategy === s.value ? "default" : "outline"}
              className="h-8 text-xs px-2"
              onClick={() => {
                setStrategy(s.value);
                handleReset();
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </ControlPanel>

      {/* Timeline visualization */}
      <div className="mt-4 space-y-1" role="img" aria-label="Retry timeline showing when each client sends retry attempts">
        {/* Time axis header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-16 text-xs text-muted-foreground shrink-0">
            Client
          </div>
          <div className="flex-1 relative h-5">
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
              <span
                key={frac}
                className="absolute text-xs text-muted-foreground -translate-x-1/2"
                style={{ left: `${frac * 100}%` }}
              >
                {Math.round(frac * maxTime)}ms
              </span>
            ))}
          </div>
        </div>

        {/* Client rows */}
        {timeline.map((client, ci) => (
          <div key={ci} className="flex items-center gap-2">
            <div className="w-16 shrink-0 flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CLIENT_COLORS[ci] }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">#{ci + 1}</span>
            </div>
            <div className="flex-1 relative h-7 bg-muted/40 rounded">
              {/* Track line */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center" aria-hidden="true">
                <div className="w-full h-px bg-border" />
              </div>
              {/* Retry markers */}
              <AnimatePresence>
                {client.times.map((time, ri) => {
                  if (ri > revealedAttempt) return null;
                  const left = (time / maxTime) * 100;
                  return (
                    <motion.div
                      key={ri}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `${left}%` }}
                      title={`Client ${ci + 1} — Attempt ${ri + 1}: ${Math.round(time)}ms`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 border-background"
                        style={{ backgroundColor: CLIENT_COLORS[ci] }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Legend / insight */}
      <div className="mt-3 text-xs text-muted-foreground">
        {strategy === "none" && (
          <p>
            <span className={statusColors.error.text}>⚠ Thundering herd:</span>{" "}
            All {CLIENT_COUNT} clients retry at identical times, causing load
            spikes.
          </p>
        )}
        {strategy === "full" && (
          <p>
            <span className={statusColors.success.text}>✓ Full jitter:</span>{" "}
            Retries spread between 0 and the backoff cap. Best distribution.
          </p>
        )}
        {strategy === "equal" && (
          <p>
            <span className={statusColors.warning.text}>~ Equal jitter:</span>{" "}
            Retries spread in the upper half of the backoff window. Moderate
            spread.
          </p>
        )}
      </div>
    </div>
  );
}
