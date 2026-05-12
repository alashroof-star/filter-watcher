import { useEffect, useRef, useState } from "react";
import { readingFor, type MetricKey, type SystemState } from "@/lib/system-state";
import { Card } from "@/components/ui/card";

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
  return key === "HM" ? v.toFixed(4) : v.toFixed(0);
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
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            waiting
              ? "bg-muted text-muted-foreground"
              : polluted
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
          }`}
        >
          {waiting ? "waiting" : polluted ? "unsafe" : "safe"}
        </span>
      </div>
      <div>
        {metrics.map((m) => (
          <div
            key={m.key}
            className="flex items-baseline justify-between border-b border-border/60 py-1.5 last:border-0"
          >
            <span className="text-sm text-muted-foreground">
              {m.label} <span className="text-xs">({m.unit})</span>
            </span>
            <span
              className={`font-mono text-base font-semibold ${
                waiting ? "text-muted-foreground" : polluted ? "text-destructive" : "text-primary"
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

const BEFORE_DELAY_MS = 15000;
const AFTER_DELAY_MS = 60000;

function Home() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [beforeValues, setBeforeValues] = useState<Values>(null);
  const [afterValues, setAfterValues] = useState<Values>(null);
  const [beforeKind, setBeforeKind] = useState<"POLLUTED" | "CLEAN" | null>(null);
  const [phase, setPhase] = useState<Phase>("IDLE");

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const rightSide = e.clientX - rect.left >= rect.width / 2;
    const beforeK: "POLLUTED" | "CLEAN" = rightSide ? "POLLUTED" : "CLEAN";

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setBeforeValues(null);
    setAfterValues(null);
    setBeforeKind(beforeK);
    setPhase("MEASURING_BEFORE");

    timersRef.current.push(
      setTimeout(() => {
        setBeforeValues(snapshotFor(beforeK));
        setPhase("FILTERING");
      }, BEFORE_DELAY_MS),
    );

    timersRef.current.push(
      setTimeout(() => {
        setAfterValues(snapshotFor("CLEAN"));
        setPhase("DONE");
      }, BEFORE_DELAY_MS + AFTER_DELAY_MS),
    );
  };

  const statusLabel =
    phase === "IDLE"
      ? "Standby"
      : phase === "MEASURING_BEFORE"
        ? "Measuring…"
        : phase === "FILTERING"
          ? "Purifying…"
          : "Done";

  const beforePolluted = beforeKind === "POLLUTED";

  return (
    <div
      style={{
        backgroundImage: `url('/bg-image.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <main className="min-h-screen px-4 py-8 relative w-[70vw] max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl text-white">Filter Fighters</h1>
          <p className="mt-1 text-sm text-white">Air & water purification monitor</p>
        </header>

        <Card className="mb-6 p-5 text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
          <div className="mt-1 text-2xl font-bold">{statusLabel}</div>

          <button
            ref={btnRef}
            onClick={handleClick}
            className="mx-auto mt-4 block w-full max-w-sm rounded-md border border-primary bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.99]"
          >
            Start System
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Before readings appear after ~15s, after readings ~1 min later.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Before</h2>
            <div className="space-y-3">
              <ReadingsCard
                title="Air"
                metrics={AIR}
                values={beforeValues}
                polluted={beforePolluted}
              />
              <ReadingsCard
                title="Water"
                metrics={WATER}
                values={beforeValues}
                polluted={beforePolluted}
              />
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">After</h2>
            <div className="space-y-3">
              <ReadingsCard title="Air" metrics={AIR} values={afterValues} polluted={false} />
              <ReadingsCard title="Water" metrics={WATER} values={afterValues} polluted={false} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
