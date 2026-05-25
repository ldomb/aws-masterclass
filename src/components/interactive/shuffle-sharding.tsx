"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const WORKER_COLORS = [
  "bg-blue-500", "bg-emerald-600", "bg-amber-600", "bg-purple-500",
  "bg-pink-500", "bg-cyan-600", "bg-orange-600", "bg-indigo-500",
];

const WORKER_BORDERS = [
  "border-blue-500", "border-emerald-600", "border-amber-600", "border-purple-500",
  "border-pink-500", "border-cyan-600", "border-orange-600", "border-indigo-500",
];

function getRegularShardAssignments(numWorkers: number, numCustomers: number, shardSize: number) {
  const numShards = Math.floor(numWorkers / shardSize);
  const shards: number[][] = [];
  for (let i = 0; i < numShards; i++) {
    shards.push(Array.from({ length: shardSize }, (_, j) => i * shardSize + j));
  }
  const assignments: Map<number, number[]> = new Map();
  for (let c = 0; c < numCustomers; c++) {
    const shardIdx = c % numShards;
    assignments.set(c, shards[shardIdx]);
  }
  return assignments;
}

function getShuffleShardAssignments(numWorkers: number, numCustomers: number, shardSize: number) {
  const assignments: Map<number, number[]> = new Map();
  const combos = getCombinations(numWorkers, shardSize);
  for (let c = 0; c < numCustomers; c++) {
    assignments.set(c, combos[c % combos.length]);
  }
  return assignments;
}

function getCombinations(n: number, k: number): number[][] {
  const result: number[][] = [];
  const combo: number[] = [];
  function backtrack(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      backtrack(i + 1);
      combo.pop();
    }
  }
  backtrack(0);
  return result;
}

function getBlastRadius(
  assignments: Map<number, number[]>,
  failedCustomer: number,
  numCustomers: number,
): { affectedWorkers: Set<number>; affectedCustomers: Set<number>; percentage: number } {
  const failedWorkers = new Set(assignments.get(failedCustomer) ?? []);
  const affectedCustomers = new Set<number>();
  for (let c = 0; c < numCustomers; c++) {
    const workers = assignments.get(c) ?? [];
    if (workers.some((w) => failedWorkers.has(w))) {
      affectedCustomers.add(c);
    }
  }
  return {
    affectedWorkers: failedWorkers,
    affectedCustomers,
    percentage: Math.round((affectedCustomers.size / numCustomers) * 100),
  };
}

interface ShardViewProps {
  title: string;
  assignments: Map<number, number[]>;
  numWorkers: number;
  numCustomers: number;
  failedCustomer: number | null;
  onClickCustomer: (c: number) => void;
}

function ShardView({ title, assignments, numWorkers, numCustomers, failedCustomer, onClickCustomer }: ShardViewProps) {
  const blast = useMemo(
    () => (failedCustomer !== null ? getBlastRadius(assignments, failedCustomer, numCustomers) : null),
    [assignments, failedCustomer, numCustomers],
  );

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {blast && (
          <Badge variant={blast.percentage > 50 ? "destructive" : "secondary"} className="text-xs">
            Blast radius: {blast.percentage}%
          </Badge>
        )}
      </div>

      {/* Workers row */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        {Array.from({ length: numWorkers }, (_, w) => {
          const isAffected = blast?.affectedWorkers.has(w);
          return (
            <motion.div
              key={w}
              className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold text-white transition-colors
                ${isAffected ? "bg-red-600 border-red-700" : `${WORKER_COLORS[w]} ${WORKER_BORDERS[w]}`}`}
              animate={isAffected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={isAffected ? { duration: 0.6, repeat: Infinity } : {}}
              aria-label={`Worker ${w}${isAffected ? " (affected)" : ""}`}
            >
              <span>W{w}</span>
              {isAffected && <span className="text-[8px] leading-none">✕</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Connections + Customers */}
      <div className="space-y-1.5">
        {Array.from({ length: numCustomers }, (_, c) => {
          const workers = assignments.get(c) ?? [];
          const isAffected = blast?.affectedCustomers.has(c);
          const isFailed = failedCustomer === c;
          return (
            <motion.div
              key={c}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 cursor-pointer transition-colors text-sm
                ${isFailed ? "bg-red-500/20 border-red-500 ring-2 ring-red-500/50" : isAffected ? "bg-red-500/10 border-red-400" : "bg-muted/30 border-border hover:bg-muted/60"}`}
              onClick={() => onClickCustomer(c)}
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Customer ${c}${isFailed ? " (poison pill)" : isAffected ? " (affected)" : ""}`}
            >
              <span className={`font-medium ${isFailed || isAffected ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                C{c}
              </span>
              <span className="text-muted-foreground text-xs ml-auto flex gap-1">
                {workers.map((w) => (
                  <span
                    key={w}
                    className={`inline-block w-5 h-5 rounded text-center text-[10px] leading-5 font-bold text-white
                      ${blast?.affectedWorkers.has(w) ? "bg-red-600" : WORKER_COLORS[w]}`}
                  >
                    {w}
                  </span>
                ))}
              </span>
              {isFailed && <span className="text-red-700 dark:text-red-400 text-xs font-medium">⚠ POISON</span>}
              {isAffected && !isFailed && <span className="text-red-700 dark:text-red-400 text-xs">affected</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ShuffleShardingDemo() {
  const [numWorkers, setNumWorkers] = useState(6);
  const [numCustomers, setNumCustomers] = useState(6);
  const shardSize = 2;
  const [failedCustomer, setFailedCustomer] = useState<number | null>(null);

  const regularAssignments = useMemo(
    () => getRegularShardAssignments(numWorkers, numCustomers, shardSize),
    [numWorkers, numCustomers],
  );
  const shuffleAssignments = useMemo(
    () => getShuffleShardAssignments(numWorkers, numCustomers, shardSize),
    [numWorkers, numCustomers],
  );

  const handleReset = useCallback(() => setFailedCustomer(null), []);
  const handleClick = useCallback(
    (c: number) => setFailedCustomer((prev) => (prev === c ? null : c)),
    [],
  );

  const clampedFailed = failedCustomer !== null && failedCustomer >= numCustomers ? null : failedCustomer;

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Shuffle Sharding</h3>
        <Badge variant="outline" className="text-xs">Click a customer to inject failure</Badge>
      </div>

      <ControlPanel showPlayback={false} onReset={handleReset}>
        <SliderControl label="Workers" value={numWorkers} min={4} max={8} onChange={(v) => { setNumWorkers(v); setFailedCustomer(null); }} />
        <SliderControl label="Customers" value={numCustomers} min={4} max={8} onChange={(v) => { setNumCustomers(v); setFailedCustomer(null); }} />
        <Button size="sm" variant="ghost" onClick={handleReset} className="text-xs">
          Clear failure
        </Button>
      </ControlPanel>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-emerald-600" aria-hidden="true" /> Healthy worker
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-600" aria-hidden="true" /> Affected worker (✕)
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ShardView
          title="Regular Sharding"
          assignments={regularAssignments}
          numWorkers={numWorkers}
          numCustomers={numCustomers}
          failedCustomer={clampedFailed}
          onClickCustomer={handleClick}
        />
        <div className="hidden md:block w-px bg-border" />
        <div className="md:hidden h-px bg-border" />
        <ShardView
          title="Shuffle Sharding"
          assignments={shuffleAssignments}
          numWorkers={numWorkers}
          numCustomers={numCustomers}
          failedCustomer={clampedFailed}
          onClickCustomer={handleClick}
        />
      </div>

      {clampedFailed !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-muted/50 border p-3 text-sm text-muted-foreground"
        >
          <p>
            <span className="font-semibold text-foreground">Customer C{clampedFailed}</span> has a poison pill.
            In regular sharding, all customers on the same shard are affected.
            With shuffle sharding, each customer gets a unique worker combination, so the blast radius is much smaller.
          </p>
        </motion.div>
      )}
    </div>
  );
}
