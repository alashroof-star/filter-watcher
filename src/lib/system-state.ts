import { useEffect, useState } from "react";

export type SystemState = "POLLUTED" | "FILTERING" | "CLEAN" | "STANDBY";

type Listener = (s: SystemState) => void;
let current: SystemState = "STANDBY";
const listeners = new Set<Listener>();

export function getSystemState() {
  return current;
}

export function setSystemState(s: SystemState) {
  current = s;
  listeners.forEach((l) => l(s));
}

export function useSystemState() {
  const [state, setState] = useState<SystemState>(current);
  useEffect(() => {
    const l: Listener = (s) => setState(s);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}

const timers: ReturnType<typeof setTimeout>[] = [];
function clearTimers() {
  while (timers.length) clearTimeout(timers.pop()!);
}

export function startSequence() {
  clearTimers();
  setSystemState("POLLUTED");
  timers.push(setTimeout(() => setSystemState("FILTERING"), 3000));
  timers.push(setTimeout(() => setSystemState("CLEAN"), 6000));
}

export function startInstantClean() {
  clearTimers();
  setSystemState("CLEAN");
}

// Ranges
export const RANGES = {
  POLLUTED: {
    SO2: [800, 1000],
    NOx: [1100, 1250],
    PM25: [10000, 12200],
    CO2: [800, 830],
    TDS: [2400, 2500],
    BOD: [1000, 1100],
    COD: [1600, 1700],
    HM: [0.07, 0.27],
  },
  CLEAN: {
    SO2: [0, 10],
    NOx: [30, 60],
    PM25: [50, 200],
    CO2: [400, 450],
    TDS: [400, 500],
    BOD: [10, 30],
    COD: [100, 150],
    HM: [0.0001, 0.0005],
  },
  FILTERING: {
    SO2: [300, 500],
    NOx: [500, 700],
    PM25: [3000, 5000],
    CO2: [600, 700],
    TDS: [1200, 1500],
    BOD: [400, 600],
    COD: [700, 900],
    HM: [0.02, 0.05],
  },
} as const;

export type MetricKey = keyof typeof RANGES.CLEAN;

export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function readingFor(state: SystemState, key: MetricKey): number {
  const s = state === "STANDBY" ? "POLLUTED" : state;
  const [a, b] = RANGES[s][key];
  return rand(a, b);
}

export function useLiveReadings(intervalMs = 2000) {
  const state = useSystemState();
  const [values, setValues] = useState(() => snapshot(state));
  useEffect(() => {
    setValues(snapshot(state));
    const id = setInterval(() => setValues(snapshot(state)), intervalMs);
    return () => clearInterval(id);
  }, [state, intervalMs]);
  return { state, values };
}

function snapshot(state: SystemState) {
  const keys: MetricKey[] = ["SO2", "NOx", "PM25", "CO2", "TDS", "BOD", "COD", "HM"];
  const out = {} as Record<MetricKey, number>;
  keys.forEach((k) => (out[k] = readingFor(state, k)));
  return out;
}
