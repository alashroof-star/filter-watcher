import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { readingFor, useSystemState, type MetricKey } from "@/lib/system-state";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Filter Fighters" },
      { name: "description", content: "Live pollutant drop charts across filtration cycles." },
    ],
  }),
  component: AnalyticsPage,
});

type Point = { t: string; SO2: number; NOx: number; PM25: number; TDS: number; BOD: number; COD: number };

function AnalyticsPage() {
  const state = useSystemState();
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    setData([]);
    const tick = () => {
      setData((prev) => {
        const i = prev.length;
        const p: Point = {
          t: `${i * 2}s`,
          SO2: readingFor(state, "SO2"),
          NOx: readingFor(state, "NOx"),
          PM25: readingFor(state, "PM25") / 10, // scale for chart
          TDS: readingFor(state, "TDS"),
          BOD: readingFor(state, "BOD"),
          COD: readingFor(state, "COD"),
        };
        const next = [...prev, p];
        return next.slice(-20);
      });
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [state]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Analytics — Feedback Loop</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live trend of pollutants across Cycle 1 → Cycle 2.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Air Pollutants (mg/Nm³)" data={data} keys={["SO2", "NOx", "PM25"]} />
        <ChartCard title="Water Pollutants (mg/L)" data={data} keys={["TDS", "BOD", "COD"]} />
      </div>

      <Card className="mt-6 p-4">
        <h3 className="font-semibold">Reference Limits</h3>
        <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
          <li>📘 UNECE 2024 — air quality standards</li>
          <li>🔬 ScienceDirect — wastewater treatment ranges</li>
          <li>🌍 WHO / EPA — safe exposure limits</li>
        </ul>
      </Card>
    </main>
  );
}

const COLORS: Record<string, string> = {
  SO2: "var(--color-chart-1)",
  NOx: "var(--color-chart-4)",
  PM25: "var(--color-chart-5)",
  TDS: "var(--color-chart-2)",
  BOD: "var(--color-chart-3)",
  COD: "var(--color-chart-4)",
};

function ChartCard({ title, data, keys }: { title: string; data: Point[]; keys: (keyof Point)[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
              }}
            />
            <Legend />
            {keys.map((k) => (
              <Area
                key={k as string}
                type="monotone"
                dataKey={k as string}
                stroke={COLORS[k as string]}
                fill={COLORS[k as string]}
                fillOpacity={0.25}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export type _M = MetricKey;
