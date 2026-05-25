"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseSimulationOptions {
  intervalMs?: number;
  onTick?: () => void;
}

export function useSimulation({ intervalMs = 1000, onTick }: UseSimulationOptions = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
      onTickRef.current?.();
    }, intervalMs / speed);
  }, [intervalMs, speed, stop]);

  const reset = useCallback(() => {
    stop();
    setTick(0);
  }, [stop]);

  const toggle = useCallback(() => {
    if (isRunning) stop();
    else start();
  }, [isRunning, start, stop]);

  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
        onTickRef.current?.();
      }, intervalMs / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, intervalMs, isRunning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isRunning, speed, setSpeed, tick, start, stop, reset, toggle };
}
