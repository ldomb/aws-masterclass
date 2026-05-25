"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { useSimulation } from "./shared/use-simulation";

interface QueueItem {
  id: number;
  enteredAt: number;
}

function depthColor(depth: number, max: number): string {
  const ratio = depth / max;
  if (ratio < 0.25) return "bg-green-600 dark:bg-green-500";
  if (ratio < 0.5) return "bg-yellow-600 dark:bg-yellow-500";
  if (ratio < 0.75) return "bg-orange-600 dark:bg-orange-500";
  return "bg-red-600 dark:bg-red-500";
}

function depthLabel(depth: number, max: number): string {
  const ratio = depth / max;
  if (ratio < 0.25) return "Normal";
  if (ratio < 0.5) return "Moderate";
  if (ratio < 0.75) return "High";
  return "Critical";
}

function depthBadgeVariant(depth: number, max: number) {
  const ratio = depth / max;
  if (ratio < 0.5) return "secondary" as const;
  if (ratio < 0.75) return "outline" as const;
  return "destructive" as const;
}

export function QueueSimulator() {
  const [arrivalRate, setArrivalRate] = useState(5);
  const [processRate, setProcessRate] = useState(5);
  const [maxQueue, setMaxQueue] = useState(30);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processed, setProcessed] = useState<QueueItem[]>([]);
  const [dropped, setDropped] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalWaitTime, setTotalWaitTime] = useState(0);

  const nextId = useRef(0);
  const tickRef = useRef(0);
  const arrivalAccum = useRef(0);
  const processAccum = useRef(0);

  const onTick = useCallback(() => {
    tickRef.current += 1;
    const currentTick = tickRef.current;

    setQueue((prev) => {
      let q = [...prev];
      const newProcessed: QueueItem[] = [];

      processAccum.current += processRate / 10;
      const toProcess = Math.floor(processAccum.current);
      processAccum.current -= toProcess;
      for (let i = 0; i < toProcess && q.length > 0; i++) {
        const item = q.shift()!;
        newProcessed.push(item);
      }

      arrivalAccum.current += arrivalRate / 10;
      const toArrive = Math.floor(arrivalAccum.current);
      arrivalAccum.current -= toArrive;
      let droppedCount = 0;
      for (let i = 0; i < toArrive; i++) {
        if (q.length < maxQueue) {
          q.push({ id: nextId.current++, enteredAt: currentTick });
        } else {
          droppedCount++;
        }
      }

      if (newProcessed.length > 0) {
        setProcessed((p) => [...p, ...newProcessed].slice(-8));
        setTotalProcessed((t) => t + newProcessed.length);
        const waitSum = newProcessed.reduce(
          (s, item) => s + (currentTick - item.enteredAt),
          0
        );
        setTotalWaitTime((t) => t + waitSum);
      }
      if (droppedCount > 0) {
        setDropped((d) => d + droppedCount);
      }

      return q;
    });
  }, [arrivalRate, processRate, maxQueue]);

  const { isRunning, toggle, reset } = useSimulation({
    intervalMs: 100,
    onTick,
  });

  const handleReset = useCallback(() => {
    reset();
    setQueue([]);
    setProcessed([]);
    setDropped(0);
    setTotalProcessed(0);
    setTotalWaitTime(0);
    nextId.current = 0;
    tickRef.current = 0;
    arrivalAccum.current = 0;
    processAccum.current = 0;
  }, [reset]);

  const avgWait =
    totalProcessed > 0
      ? ((totalWaitTime / totalProcessed) * 100) / 1000
      : 0;
  const throughput = totalProcessed > 0 && tickRef.current > 0
    ? (totalProcessed / (tickRef.current / 10))
    : 0;

  const isBimodal = arrivalRate > processRate;
  const queueDepthStatus = depthLabel(queue.length, maxQueue);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Queue Simulator
      </h3>
      <p className="text-sm text-muted-foreground">
        Observe how queues behave when arrival rate exceeds processing rate.
        Watch for bimodal behavior: the queue either drains or grows unbounded.
      </p>

      {/* Metrics */}
      <div className="flex flex-wrap gap-3">
        <Badge variant={depthBadgeVariant(queue.length, maxQueue)}>
          Depth: {queue.length}/{maxQueue} — {queueDepthStatus}
        </Badge>
        <Badge variant="secondary">
          Avg Wait: {avgWait.toFixed(1)}s
        </Badge>
        <Badge variant="secondary">
          Throughput: {throughput.toFixed(1)}/s
        </Badge>
        <Badge variant={dropped > 0 ? "destructive" : "secondary"}>
          Dropped: {dropped}
        </Badge>
        {isBimodal && isRunning && (
          <Badge variant="outline" className="text-orange-700 dark:text-orange-400 border-orange-500">
            ⚠ Arrival &gt; Processing — unbounded growth risk
          </Badge>
        )}
      </div>

      {/* Queue visualization */}
      <div className="relative rounded-lg border bg-muted/20 p-4 min-h-[80px] overflow-hidden">
        <div className="flex items-center gap-1">
          {/* Arrival indicator */}
          <div className="flex flex-col items-center mr-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">IN</span>
            <motion.div
              animate={{ x: isRunning ? [0, 4, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="text-muted-foreground"
              aria-hidden="true"
            >
              &rarr;
            </motion.div>
          </div>

          {/* Queue box */}
          <div
            className="flex-1 flex items-center gap-0.5 min-h-[40px] border border-dashed border-muted-foreground/50 rounded px-2 py-1 overflow-hidden"
            role="img"
            aria-label={`Queue: ${queue.length} of ${maxQueue} items — ${queueDepthStatus}`}
          >
            <AnimatePresence mode="popLayout">
              {queue.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className={`w-5 h-5 rounded-sm shrink-0 ${depthColor(queue.length, maxQueue)}`}
                />
              ))}
              {queue.length === 0 && (
                <span className="text-xs text-muted-foreground italic">
                  empty
                </span>
              )}
            </AnimatePresence>
          </div>

          {/* Exit indicator */}
          <div className="flex flex-col items-center ml-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">OUT</span>
            <motion.div
              animate={{ x: isRunning ? [0, 4, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="text-muted-foreground"
              aria-hidden="true"
            >
              &rarr;
            </motion.div>
          </div>

          {/* Recently processed */}
          <div className="flex items-center gap-0.5 ml-1" aria-hidden="true">
            <AnimatePresence>
              {processed.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0.3, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-4 h-4 rounded-sm bg-green-600/60 dark:bg-green-400/50 shrink-0"
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Full indicator */}
        {queue.length >= maxQueue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1 right-2 text-xs font-bold text-red-700 dark:text-red-400"
            role="alert"
          >
            ⚠ FULL — DROPPING ITEMS
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <ControlPanel isRunning={isRunning} onToggle={toggle} onReset={handleReset}>
        <SliderControl
          label="Arrival Rate"
          value={arrivalRate}
          min={1}
          max={20}
          onChange={setArrivalRate}
          unit="/s"
        />
        <SliderControl
          label="Process Rate"
          value={processRate}
          min={1}
          max={20}
          onChange={setProcessRate}
          unit="/s"
        />
        <SliderControl
          label="Max Queue"
          value={maxQueue}
          min={10}
          max={100}
          step={5}
          onChange={setMaxQueue}
        />
      </ControlPanel>
    </div>
  );
}
