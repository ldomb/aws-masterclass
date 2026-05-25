"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ControlPanel } from "./shared/control-panel";
import { AnimatedNode } from "./shared/animated-node";
import type { StatusType } from "./shared/theme";

type ServiceStatus = "healthy" | "degraded" | "failed";

interface Service {
  id: string;
  label: string;
  tier: number;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

const services: Service[] = [
  { id: "api-gw", label: "API Gateway", tier: 1, x: 250, y: 30 },
  { id: "auth", label: "Auth Service", tier: 2, x: 80, y: 150 },
  { id: "product", label: "Product Service", tier: 2, x: 250, y: 150 },
  { id: "order", label: "Order Service", tier: 2, x: 420, y: 150 },
  { id: "payment", label: "Payment Service", tier: 3, x: 340, y: 270 },
  { id: "inventory", label: "Inventory Service", tier: 3, x: 500, y: 270 },
];

const edges: Edge[] = [
  { from: "api-gw", to: "auth" },
  { from: "api-gw", to: "product" },
  { from: "api-gw", to: "order" },
  { from: "order", to: "payment" },
  { from: "order", to: "inventory" },
];

function getDependents(serviceId: string): string[] {
  return edges.filter((e) => e.to === serviceId).map((e) => e.from);
}

function toNodeStatus(s: ServiceStatus): StatusType {
  if (s === "healthy") return "success";
  if (s === "degraded") return "warning";
  return "error";
}

const NODE_W = 100;
const NODE_H = 48;
const SVG_W = 600;
const SVG_H = 340;

export function FailureCascadeDemo() {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>(
    () => Object.fromEntries(services.map((s) => [s.id, "healthy"]))
  );
  const [circuitBreaker, setCircuitBreaker] = useState(false);
  const [cascading, setCascading] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCascading(false);
    setStatuses(Object.fromEntries(services.map((s) => [s.id, "healthy"])));
  }, []);

  const injectFailure = useCallback(
    (serviceId: string) => {
      if (cascading) return;
      setCascading(true);

      setStatuses((prev) => ({ ...prev, [serviceId]: "failed" }));

      if (circuitBreaker) {
        const directDeps = getDependents(serviceId);
        const t = setTimeout(() => {
          setStatuses((prev) => {
            const next = { ...prev };
            directDeps.forEach((id) => {
              if (next[id] === "healthy") next[id] = "degraded";
            });
            return next;
          });
          setCascading(false);
        }, 500);
        timersRef.current.push(t);
        return;
      }

      let frontier = [serviceId];
      const visited = new Set([serviceId]);
      let delay = 0;

      const propagate = () => {
        const nextFrontier: string[] = [];
        for (const id of frontier) {
          for (const dep of getDependents(id)) {
            if (!visited.has(dep)) {
              visited.add(dep);
              nextFrontier.push(dep);
            }
          }
        }
        if (nextFrontier.length === 0) {
          const t = setTimeout(() => setCascading(false), delay + 200);
          timersRef.current.push(t);
          return;
        }

        delay += 700;
        const t1 = setTimeout(() => {
          setStatuses((prev) => {
            const next = { ...prev };
            nextFrontier.forEach((id) => {
              if (next[id] === "healthy") next[id] = "degraded";
            });
            return next;
          });
        }, delay);
        timersRef.current.push(t1);

        delay += 700;
        const t2 = setTimeout(() => {
          setStatuses((prev) => {
            const next = { ...prev };
            nextFrontier.forEach((id) => {
              if (next[id] !== "failed") next[id] = "failed";
            });
            return next;
          });
        }, delay);
        timersRef.current.push(t2);

        frontier = nextFrontier;
        const t3 = setTimeout(propagate, 0);
        timersRef.current.push(t3);
      };

      propagate();
    },
    [cascading, circuitBreaker]
  );

  const counts = { healthy: 0, degraded: 0, failed: 0 };
  for (const s of Object.values(statuses)) counts[s]++;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Failure Cascade Demo
      </h3>
      <p className="text-sm text-muted-foreground">
        Click any service to inject a failure and watch it cascade upstream
        through dependents.
      </p>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-2 border-emerald-500 bg-emerald-500/20" aria-hidden="true" />
          Healthy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-2 border-amber-500 bg-amber-500/20" aria-hidden="true" />
          Degraded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-2 border-red-500 bg-red-500/20" aria-hidden="true" />
          Failed
        </span>
      </div>

      {/* Graph */}
      <div
        className="relative rounded-lg border bg-background p-2 overflow-x-auto"
        role="img"
        aria-label="Service dependency graph showing failure cascade"
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ maxWidth: SVG_W }}
          aria-hidden="true"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const fromSvc = services.find((s) => s.id === edge.from)!;
            const toSvc = services.find((s) => s.id === edge.to)!;
            const x1 = fromSvc.x + NODE_W / 2;
            const y1 = fromSvc.y + NODE_H;
            const x2 = toSvc.x + NODE_W / 2;
            const y2 = toSvc.y;

            const isBroken =
              circuitBreaker &&
              statuses[edge.to] === "failed" &&
              statuses[edge.from] !== "healthy";

            const isFailed = statuses[edge.to] === "failed";

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isFailed ? "stroke-red-500" : "stroke-muted-foreground/70"}
                strokeWidth={isFailed ? 2.5 : 2}
                strokeDasharray={isBroken ? "6 4" : undefined}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 Z"
                className="fill-muted-foreground/80"
              />
            </marker>
          </defs>
        </svg>

        {/* Nodes overlaid */}
        <div
          className="absolute inset-0 p-2"
          style={{ pointerEvents: "none" }}
        >
          <div className="relative" style={{ width: SVG_W, height: SVG_H }}>
            {services.map((svc) => (
              <div
                key={svc.id}
                className="absolute"
                style={{
                  left: svc.x,
                  top: svc.y,
                  width: NODE_W,
                  height: NODE_H,
                  pointerEvents: "auto",
                }}
              >
                <AnimatedNode
                  label={svc.label}
                  status={toNodeStatus(statuses[svc.id])}
                  size={NODE_H}
                  shape="box"
                  className="!w-full !h-full"
                  onClick={() => injectFailure(svc.id)}
                  pulse={statuses[svc.id] === "degraded"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="border-emerald-500 text-emerald-700 dark:text-emerald-400"
        >
          ✓ Healthy: {counts.healthy}
        </Badge>
        <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
          ⚡ Degraded: {counts.degraded}
        </Badge>
        <Badge variant="outline" className="border-red-500 text-red-700 dark:text-red-400">
          ✕ Failed: {counts.failed}
        </Badge>
      </div>

      {/* Controls */}
      <ControlPanel showPlayback={false}>
        <Button
          size="sm"
          variant={circuitBreaker ? "default" : "outline"}
          onClick={() => setCircuitBreaker((v) => !v)}
        >
          Circuit Breaker: {circuitBreaker ? "ON" : "OFF"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      </ControlPanel>
    </div>
  );
}
