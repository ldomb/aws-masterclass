"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ControlPanel, SliderControl } from "./shared/control-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
} from "lucide-react";

type FailureMode = "success" | "timeout" | "server-error" | "network-drop";

interface TimelineEvent {
  label: string;
  timeMs: number;
  color: string;
  type: "send" | "receive" | "error" | "retry";
}

type Phase =
  | "idle"
  | "sending"
  | "processing"
  | "responding"
  | "done"
  | "timeout-waiting"
  | "timeout-error"
  | "server-error-flash"
  | "server-error-responding"
  | "network-drop"
  | "retry-delay"
  | "retry-sending"
  | "retry-processing"
  | "retry-responding"
  | "retry-done";

export function RequestFlowSimulator() {
  const [failureMode, setFailureMode] = useState<FailureMode>("success");
  const [timeoutMs, setTimeoutMs] = useState(3000);
  const [showRetry, setShowRetry] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addEvent = useCallback(
    (label: string, color: string, type: TimelineEvent["type"]) => {
      const timeMs = Date.now() - startTimeRef.current;
      setTimeline((prev) => [...prev, { label, timeMs, color, type }]);
    },
    [],
  );

  const schedulePhase = useCallback(
    (nextPhase: Phase, delayMs: number) => {
      clearTimers();
      timerRef.current = setTimeout(() => setPhase(nextPhase), delayMs);
    },
    [clearTimers],
  );

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  // State machine
  useEffect(() => {
    switch (phase) {
      case "sending":
        addEvent("Request sent", "#3b82f6", "send");
        schedulePhase(
          failureMode === "network-drop" ? "network-drop" : "processing",
          800,
        );
        break;

      case "network-drop":
        addEvent("Network drop", "#ef4444", "error");
        if (showRetry) {
          schedulePhase("retry-delay", 1200);
        } else {
          schedulePhase("done", 1200);
        }
        break;

      case "processing":
        if (failureMode === "timeout") {
          schedulePhase("timeout-waiting", 600);
        } else if (failureMode === "server-error") {
          schedulePhase("server-error-flash", 400);
        } else {
          schedulePhase("responding", 600);
        }
        break;

      case "responding":
        addEvent("Response received", "#22c55e", "receive");
        schedulePhase("done", 800);
        break;

      case "timeout-waiting":
        addEvent(`Timeout (${timeoutMs}ms)`, "#f59e0b", "error");
        schedulePhase("timeout-error", 1500);
        break;

      case "timeout-error":
        if (showRetry) {
          schedulePhase("retry-delay", 800);
        } else {
          schedulePhase("done", 0);
        }
        break;

      case "server-error-flash":
        addEvent("500 Internal Server Error", "#ef4444", "error");
        schedulePhase("server-error-responding", 800);
        break;

      case "server-error-responding":
        if (showRetry) {
          schedulePhase("retry-delay", 800);
        } else {
          schedulePhase("done", 0);
        }
        break;

      case "retry-delay":
        addEvent("Retry after delay", "#f59e0b", "retry");
        schedulePhase("retry-sending", 1200);
        break;

      case "retry-sending":
        addEvent("Retry request sent", "#3b82f6", "send");
        schedulePhase("retry-processing", 800);
        break;

      case "retry-processing":
        schedulePhase("retry-responding", 600);
        break;

      case "retry-responding":
        addEvent("Retry success", "#22c55e", "receive");
        schedulePhase("retry-done", 800);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSend = useCallback(() => {
    clearTimers();
    startTimeRef.current = Date.now();
    setTimeline([]);
    setPhase("sending");
  }, [clearTimers]);

  const handleReset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setTimeline([]);
  }, [clearTimers]);

  const isAnimating = phase !== "idle" && phase !== "done" && phase !== "retry-done";

  // Arrow / dot positions
  const showRequestArrow =
    phase === "sending" || phase === "retry-sending";
  const showResponseArrow =
    phase === "responding" || phase === "retry-responding";
  const showErrorResponse = phase === "server-error-responding";
  const showNetworkDrop = phase === "network-drop";
  const showTimeoutClock =
    phase === "timeout-waiting" || phase === "timeout-error";
  const serverFlash = phase === "server-error-flash";
  const showRetryDelay = phase === "retry-delay";

  const clientStatus = (() => {
    if (phase === "idle") return null;
    if (phase === "timeout-error") return "timeout";
    if (phase === "server-error-responding") return "error";
    if (phase === "network-drop") return "error";
    if (phase === "done" || phase === "retry-done") {
      if (
        failureMode === "success" ||
        (showRetry &&
          (failureMode === "timeout" ||
            failureMode === "server-error" ||
            failureMode === "network-drop"))
      )
        return "success";
      return "error";
    }
    if (phase === "responding" || phase === "retry-responding") return "receiving";
    return "waiting";
  })();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Request Flow Simulator
      </h3>

      <ControlPanel showPlayback={false}>
        <Tabs
          value={failureMode}
          onValueChange={(v) => {
            setFailureMode(v as FailureMode);
            handleReset();
          }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="success" className="text-xs h-7 px-2">
              Success
            </TabsTrigger>
            <TabsTrigger value="timeout" className="text-xs h-7 px-2">
              Timeout
            </TabsTrigger>
            <TabsTrigger value="server-error" className="text-xs h-7 px-2">
              Server Error
            </TabsTrigger>
            <TabsTrigger value="network-drop" className="text-xs h-7 px-2">
              Network Drop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {failureMode === "timeout" && (
          <SliderControl
            label="Timeout"
            value={timeoutMs}
            min={1000}
            max={10000}
            step={500}
            onChange={setTimeoutMs}
            unit="ms"
          />
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showRetry ? "default" : "outline"}
            className="h-7 text-xs px-2"
            onClick={() => {
              setShowRetry(!showRetry);
              handleReset();
            }}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </ControlPanel>

      {/* Main visualization area */}
      <div className="mt-4 relative h-48 flex items-center justify-between px-4">
        {/* Client box */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-2 rounded-lg border-2 p-4 w-28"
          animate={{
            borderColor:
              clientStatus === "success"
                ? "#22c55e"
                : clientStatus === "error" || clientStatus === "timeout"
                  ? "#ef4444"
                  : clientStatus === "receiving"
                    ? "#3b82f6"
                    : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          <Monitor className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Client</span>
          <AnimatePresence mode="wait">
            {clientStatus === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge variant="outline" className="text-[10px] h-5">
                  Waiting...
                </Badge>
              </motion.div>
            )}
            {clientStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge className="text-[10px] h-5 bg-emerald-500">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" />
                  OK
                </Badge>
              </motion.div>
            )}
            {clientStatus === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge className="text-[10px] h-5 bg-red-500">
                  <XCircle className="h-3 w-3 mr-0.5" />
                  Error
                </Badge>
              </motion.div>
            )}
            {clientStatus === "timeout" && (
              <motion.div
                key="timeout"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge className="text-[10px] h-5 bg-amber-500">
                  <Clock className="h-3 w-3 mr-0.5" />
                  Timeout
                </Badge>
              </motion.div>
            )}
            {clientStatus === "receiving" && (
              <motion.div
                key="receiving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge variant="outline" className="text-[10px] h-5 border-blue-500 text-blue-500">
                  Receiving
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Connection area (arrows/dots animate here) */}
        <div className="absolute left-36 right-36 top-1/2 -translate-y-1/2 h-2">
          {/* Base line */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-border" />
          </div>

          {/* Request arrow: dot moving left to right */}
          <AnimatePresence>
            {showRequestArrow && (
              <motion.div
                key="request-dot"
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-background"
                initial={{ left: "0%", opacity: 1 }}
                animate={{ left: "100%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Response arrow: dot moving right to left (success) */}
          <AnimatePresence>
            {showResponseArrow && (
              <motion.div
                key="response-dot"
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-600 dark:bg-emerald-500 border-2 border-background"
                initial={{ left: "100%", opacity: 1 }}
                animate={{ left: "0%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Error response: dot moving right to left (red) */}
          <AnimatePresence>
            {showErrorResponse && (
              <motion.div
                key="error-dot"
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-600 dark:bg-red-500 border-2 border-background"
                initial={{ left: "100%", opacity: 1 }}
                animate={{ left: "0%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Network drop: dot fades mid-way */}
          <AnimatePresence>
            {showNetworkDrop && (
              <motion.div
                key="drop-dot"
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: "45%" }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-4 h-4 rounded-full bg-red-600 dark:bg-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeout clock icon */}
          <AnimatePresence>
            {showTimeoutClock && (
              <motion.div
                key="clock"
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: "50%" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Clock className="h-5 w-5 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Retry delay indicator */}
          <AnimatePresence>
            {showRetryDelay && (
              <motion.div
                key="retry-delay"
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1"
                style={{ left: "50%" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RotateCcw className="h-4 w-4 text-amber-500" />
                </motion.div>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                  retrying...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Server box */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-2 rounded-lg border-2 p-4 w-28"
          animate={{
            borderColor: serverFlash ? "#ef4444" : "var(--border)",
            backgroundColor: serverFlash
              ? "rgba(239, 68, 68, 0.1)"
              : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          <Server className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Server</span>
          <AnimatePresence>
            {serverFlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge className="text-[10px] h-5 bg-red-500">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  500
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Send button */}
      <div className="flex justify-center mt-2">
        <Button
          onClick={handleSend}
          disabled={isAnimating}
          size="sm"
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          Send Request
        </Button>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Timeline
          </h4>
          <div className="space-y-1.5">
            {timeline.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className="font-mono text-muted-foreground w-14 text-right shrink-0">
                  {event.timeMs}ms
                </span>
                <div
                  className="w-3 h-3 rounded-full shrink-0 border border-background"
                  style={{ backgroundColor: event.color }}
                />
                <span className="text-foreground">{event.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
