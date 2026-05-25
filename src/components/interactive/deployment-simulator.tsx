"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { Rocket, RotateCcw } from "lucide-react";

type Strategy = "canary" | "blue-green" | "rolling";
type InstanceState = "v1" | "v2" | "failed";

const INSTANCE_COUNT = 12;

const stateColors: Record<InstanceState, { bg: string; border: string }> = {
  v1: { bg: "bg-blue-600/80 dark:bg-blue-500/80", border: "border-blue-500 dark:border-blue-400" },
  v2: { bg: "bg-emerald-600/80 dark:bg-emerald-500/80", border: "border-emerald-500 dark:border-emerald-400" },
  failed: { bg: "bg-red-600/80 dark:bg-red-500/80", border: "border-red-500 dark:border-red-400" },
};

const stateLabels: Record<InstanceState, string> = {
  v1: "v1",
  v2: "v2",
  failed: "ERR",
};

const stateDescriptions: Record<InstanceState, string> = {
  v1: "Version 1 — current",
  v2: "Version 2 — new",
  failed: "Failed — error during deploy",
};

// Canary batches: 1, then 2 more, then 4 more, then remaining 5
const canaryBatches = [[0], [1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11]];

function getFailurePoint(strategy: Strategy): number {
  if (strategy === "canary") return 1;
  if (strategy === "blue-green") return 0;
  return 3;
}

export function DeploymentSimulator() {
  const [instances, setInstances] = useState<InstanceState[]>(
    Array(INSTANCE_COUNT).fill("v1")
  );
  const [strategy, setStrategy] = useState<Strategy>("canary");
  const [speed, setSpeed] = useState(500);
  const [errorInjection, setErrorInjection] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("Ready");
  const cancelRef = useRef(false);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        const check = setInterval(() => {
          if (cancelRef.current) {
            clearTimeout(id);
            clearInterval(check);
            resolve();
          }
        }, 50);
      }),
    []
  );

  const rollback = useCallback(
    async (current: InstanceState[]) => {
      setStatus("Rolling back...");
      const updated = [...current];
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        if (cancelRef.current) break;
        if (updated[i] !== "v1") {
          updated[i] = "v1";
          setInstances([...updated]);
          await sleep(speed / 3);
        }
      }
      setProgress(0);
      setStatus("Rolled back");
      setDeploying(false);
    },
    [sleep, speed]
  );

  const deploy = useCallback(async () => {
    cancelRef.current = false;
    setDeploying(true);
    setProgress(0);
    setStatus("Deploying...");

    const state: InstanceState[] = Array(INSTANCE_COUNT).fill("v1");
    setInstances([...state]);

    const failAt = getFailurePoint(strategy);
    let deployed = 0;

    const updateInstance = (idx: number, val: InstanceState) => {
      state[idx] = val;
      deployed++;
      setInstances([...state]);
      setProgress(Math.round((deployed / INSTANCE_COUNT) * 100));
    };

    if (strategy === "canary") {
      for (let b = 0; b < canaryBatches.length; b++) {
        if (cancelRef.current) return;
        if (errorInjection && b === failAt) {
          for (const idx of canaryBatches[b]) updateInstance(idx, "failed");
          setStatus("Deployment failed!");
          await sleep(speed);
          await rollback(state);
          return;
        }
        for (const idx of canaryBatches[b]) {
          updateInstance(idx, "v2");
        }
        setStatus(
          b === 0
            ? "Canary instance deployed, monitoring..."
            : `Batch ${b + 1} deployed...`
        );
        await sleep(speed * 2);
      }
    } else if (strategy === "blue-green") {
      setStatus("Preparing green environment...");
      await sleep(speed * 2);
      if (cancelRef.current) return;

      if (errorInjection) {
        for (let i = 0; i < INSTANCE_COUNT; i++) updateInstance(i, "failed");
        setStatus("Deployment failed!");
        await sleep(speed);
        await rollback(state);
        return;
      }

      for (let i = 0; i < INSTANCE_COUNT; i++) updateInstance(i, "v2");
      setStatus("Traffic switched to green");
    } else {
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        if (cancelRef.current) return;
        if (errorInjection && i === failAt) {
          updateInstance(i, "failed");
          setStatus("Deployment failed!");
          await sleep(speed);
          await rollback(state);
          return;
        }
        updateInstance(i, "v2");
        setStatus(`Updating instance ${i + 1}...`);
        await sleep(speed);
      }
    }

    if (!cancelRef.current) {
      setProgress(100);
      setStatus("Deployment complete!");
      setDeploying(false);
    }
  }, [strategy, speed, errorInjection, sleep, rollback]);

  const reset = () => {
    cancelRef.current = true;
    setInstances(Array(INSTANCE_COUNT).fill("v1"));
    setProgress(0);
    setStatus("Ready");
    setDeploying(false);
  };

  // Count instances by state for summary
  const v1Count = instances.filter((s) => s === "v1").length;
  const v2Count = instances.filter((s) => s === "v2").length;
  const failedCount = instances.filter((s) => s === "failed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Deployment Simulator
        </h3>
        <Badge variant="outline" className="font-mono text-xs">
          {status}
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" aria-hidden="true" />
          v1 — current ({v1Count})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500" aria-hidden="true" />
          v2 — new ({v2Count})
        </span>
        {failedCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-red-600 dark:bg-red-500" aria-hidden="true" />
            ERR — failed ({failedCount})
          </span>
        )}
      </div>

      {/* Instance grid — responsive */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
        role="grid"
        aria-label="Instance deployment grid"
      >
        {instances.map((state, i) => {
          const colors = stateColors[state];
          return (
            <motion.div
              key={i}
              animate={{ backgroundColor: undefined }}
              className={`${colors.bg} ${colors.border} border rounded-md p-3 flex flex-col items-center justify-center transition-colors duration-300`}
              role="gridcell"
              aria-label={`Instance i-${String(i).padStart(2, "0")}: ${stateDescriptions[state]}`}
            >
              <span className="text-xs text-white/80 font-mono">
                i-{String(i).padStart(2, "0")}
              </span>
              <motion.span
                key={state}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-bold text-white"
              >
                {stateLabels[state]}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-2 w-full rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Deployment progress: ${progress}%`}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Controls */}
      <ControlPanel showPlayback={false}>
        <Tabs
          value={strategy}
          onValueChange={(v) => !deploying && setStrategy(v as Strategy)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="canary" className="text-xs px-2 h-6">
              Canary
            </TabsTrigger>
            <TabsTrigger value="blue-green" className="text-xs px-2 h-6">
              Blue/Green
            </TabsTrigger>
            <TabsTrigger value="rolling" className="text-xs px-2 h-6">
              Rolling
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <SliderControl
          label="Speed"
          value={speed}
          min={100}
          max={1500}
          step={100}
          onChange={setSpeed}
          unit="ms"
        />

        <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={errorInjection}
            onChange={(e) => setErrorInjection(e.target.checked)}
            className="accent-destructive"
            disabled={deploying}
          />
          Inject error
        </label>

        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            size="sm"
            onClick={deploy}
            disabled={deploying}
            className="h-9 gap-1.5"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
            Deploy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="h-9 w-9 p-0"
            aria-label="Reset deployment"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </ControlPanel>
    </div>
  );
}
