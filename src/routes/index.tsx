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

type Phase = "IDLE" | "MEASURING_BEFORE" | "FILTERING" | "DONE";

function Index() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [beforeValues, setBeforeValues] = useState<Values>(null);
  const [afterValues, setAfterValues] = useState<Values>(null);
  const [beforeKind, setBeforeKind] = useState<"POLLUTED" | "CLEAN" | null>(null);
  const [phase, setPhase] = useState<Phase>("IDLE");

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rightSide = x >= rect.width / 2;
    const beforeK: "POLLUTED" | "CLEAN" = rightSide ? "POLLUTED" : "CLEAN";

    // Reset everything
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setBeforeValues(null);
    setAfterValues(null);
    setBeforeKind(beforeK);
    setPhase("MEASURING_BEFORE");
    setSystemState(rightSide ? "POLLUTED" : "CLEAN");

    // Step 1: after 3s, reveal BEFORE readings (frozen)
    timersRef.current.push(
      setTimeout(() => {
        setBeforeValues(snapshotFor(beforeK));
        setPhase("FILTERING");
        setSystemState("FILTERING");
      }, 3000),
    );

    // Step 2: after 3s + 8s = 11s total, reveal AFTER readings (always clean, frozen)
    timersRef.current.push(
      setTimeout(() => {
        setAfterValues(snapshotFor("CLEAN"));
        setPhase("DONE");
        setSystemState("CLEAN");
      }, 11000),
    );
  };

  const statusLabel =
    phase === "IDLE"
      ? "STANDBY"
      : phase === "MEASURING_BEFORE"
        ? "MEASURING…"
        : phase === "FILTERING"
          ? "PURIFYING…"
          : "DONE — CLEAN";

  const statusColor =
    phase === "IDLE"
      ? "text-muted-foreground"
      : phase === "MEASURING_BEFORE"
        ? "text-destructive"
        : phase === "FILTERING"
          ? "text-chart-4"
          : "text-accent";

  const beforePolluted = beforeKind === "POLLUTED";
  const afterPolluted = false;

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
