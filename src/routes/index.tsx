import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  RANGES,
  setSystemState,
  useSystemState,
  readingFor,
  type MetricKey,
  type SystemState,
} from "@/lib/system-state";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Filter Fighters Dashboard" },
      { name: "description", content: "Live system overview for the Filter Fighters air & water purification system." },
    ],
  }),
  component: Index,
});

const AIR: { key: MetricKey; label: string; unit: string }[] = [
  { key: "SO2", label: "SO₂", unit: "mg/Nm³" },
  { key: "NOx", label: "NOx", unit: "mg/Nm³" },
  { key: "PM25", label: "PM2.5", unit: "µg/m³" },
  { key: "CO2", label: "CO₂", unit: "kg/ton" },
];
const WATER: { key: MetricKey; label: string; unit: string }[] = [
  { key: "TDS", label: "TDS", unit: "mg/L" },
  { key: "BOD", label: "BOD", unit: "mg/L" },
  { key: "COD", label: "COD", unit: "mg/L" },
  { key: "HM", label: "Heavy Metals", unit: "mg/L" },
];

function fmt(v: number, key: MetricKey) {
  if (key === "HM") return v.toFixed(4);
  return v.toFixed(0);
}

type Values = Record<MetricKey, number> | null;

function ReadingsCard({
  title,
  metrics,
  values,
  polluted,
}: {
  title: string;
  metrics: { key: MetricKey; label: string; unit: string }[];
  values: Values;
  polluted: boolean;
}) {
  const waiting = values === null;
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span
          className={`rounded px-2 py-0.5 font-mono text-xs ${
            waiting
              ? "bg-muted text-muted-foreground"
              : polluted
                ? "bg-destructive/20 text-destructive"
                : "bg-accent/20 text-accent"
          }`}
        >
          {waiting ? "● WAITING" : polluted ? "● UNSAFE" : "● SAFE"}
        </span>
      </div>
      <div>
        {metrics.map((m) => (
          <div
            key={m.key}
            className="flex items-baseline justify-between border-b border-border/60 py-2 last:border-0"
          >
            <span className="text-sm text-muted-foreground">
              {m.label} <span className="text-xs">({m.unit})</span>
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                waiting
                  ? "text-muted-foreground"
                  : polluted
                    ? "text-destructive"
                    : "text-accent"
              }`}
            >
              {waiting ? "—" : fmt(values![m.key], m.key)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function snapshotFor(s: SystemState): Record<MetricKey, number> {
  const keys: MetricKey[] = ["SO2", "NOx", "PM25", "CO2", "TDS", "BOD", "COD", "HM"];
  const out = {} as Record<MetricKey, number>;
  keys.forEach((k) => (out[k] = readingFor(s, k)));
  return out;
}

function Index() {
  const state = useSystemState();
  const btnRef = useRef<HTMLButtonElement>(null);

  // null until first click
  const [beforeValues, setBeforeValues] = useState<Values>(null);
  const [afterValues, setAfterValues] = useState<Values>(null);
  // "before" side state: POLLUTED (right click) or CLEAN (left click)
  const [beforeKind, setBeforeKind] = useState<"POLLUTED" | "CLEAN" | null>(null);
  const [started, setStarted] = useState(false);

  // Live update after-values every 2s based on current global state
  useEffect(() => {
    if (!started) return;
    setAfterValues(snapshotFor(state));
    const id = setInterval(() => setAfterValues(snapshotFor(state)), 2000);
    return () => clearInterval(id);
  }, [state, started]);

  // Live update before-values too (so they look "live" but stay in the same band)
  useEffect(() => {
    if (!started || !beforeKind) return;
    setBeforeValues(snapshotFor(beforeKind));
    const id = setInterval(() => setBeforeValues(snapshotFor(beforeKind)), 2000);
    return () => clearInterval(id);
  }, [beforeKind, started]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rightSide = x >= rect.width / 2;

    // Reset
    setStarted(false);
    setBeforeValues(null);
    setAfterValues(null);

    // Tiny delay so the "waiting" state is visible on every click
    setTimeout(() => {
      setStarted(true);
      if (rightSide) {
        // Before BAD, after CLEAN
        setBeforeKind("POLLUTED");
        setSystemState("CLEAN");
      } else {
        // Both clean
        setBeforeKind("CLEAN");
        setSystemState("CLEAN");
      }
    }, 250);
  };

  const statusLabel = !started
    ? "STANDBY"
    : state === "CLEAN"
      ? "ACTIVE"
      : state === "FILTERING"
        ? "PURIFYING"
        : "ALERT";

  const statusColor = !started
    ? "text-muted-foreground"
    : state === "CLEAN"
      ? "text-accent"
      : state === "FILTERING"
        ? "text-chart-4"
        : "text-destructive";

  const beforePolluted = beforeKind === "POLLUTED";
  const afterPolluted = state === "POLLUTED";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Sustainable Cement Factory // IoT Ecosystem
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Filter Fighters Control Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Air purification · Water filtration · Smart irrigation
        </p>
      </section>

      <Card className="mb-6 p-6 text-center">
        <div className="mb-2 font-mono text-xs uppercase text-muted-foreground">
          System Status
        </div>
        <div className={`text-4xl font-black tracking-wider ${statusColor}`}>{statusLabel}</div>

        <button
          ref={btnRef}
          onClick={handleClick}
          className="group relative mx-auto mt-5 block w-full max-w-md overflow-hidden rounded-lg border-2 border-accent bg-accent/10 px-6 py-5 font-mono text-lg font-bold uppercase tracking-widest text-accent transition-all hover:bg-accent/20 active:scale-[0.99]"
        >
          ▶ Start System
          <span className="mt-1 block text-[10px] font-normal tracking-normal text-muted-foreground">
            (each click resets the readings)
          </span>
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Readings update live every 2 seconds after you start.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2
            className={`mb-3 font-mono text-sm uppercase tracking-wider ${
              beforePolluted ? "text-destructive" : "text-accent"
            }`}
          >
            ◀ Before Filtration
          </h2>
          <div className="space-y-4">
            <ReadingsCard title="Air Emissions" metrics={AIR} values={beforeValues} polluted={beforePolluted} />
            <ReadingsCard title="Water & Liquid Waste" metrics={WATER} values={beforeValues} polluted={beforePolluted} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-accent">
            After Filtration ▶
          </h2>
          <div className="space-y-4">
            <ReadingsCard title="Air Emissions" metrics={AIR} values={afterValues} polluted={afterPolluted} />
            <ReadingsCard title="Water & Liquid Waste" metrics={WATER} values={afterValues} polluted={afterPolluted} />
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold">🌫 Air Purification</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Captures SO₂, NOx and particulates using activated carbon adsorption.
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">💧 Water Filtration</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-stage sponge, mesh and sand filters drop TDS, BOD and COD.
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">🌱 Smart Irrigation</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Recycled water reused safely, monitored by soil-moisture sensors.
          </p>
        </Card>
      </section>

      <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground">
        Safe limits referenced from WHO / EPA · UNECE 2024
      </p>
      <span className="hidden">{Object.values(RANGES.CLEAN).flat().join(",")}</span>
    </main>
  );
}
