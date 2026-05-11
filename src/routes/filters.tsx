import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useSystemState } from "@/lib/system-state";

export const Route = createFileRoute("/filters")({
  head: () => ({
    meta: [
      { title: "Filter Health — Filter Fighters" },
      { name: "description", content: "Stage 1 and Stage 2 filter status & clogging alerts." },
    ],
  }),
  component: FiltersPage,
});

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded px-2 py-0.5 font-mono text-xs ${
        ok ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
      }`}
    >
      ● {label}
    </span>
  );
}

function FilterCard({
  name,
  load,
  ok,
}: {
  name: string;
  load: number;
  ok: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <StatusBadge ok={ok} label={ok ? "OK" : "CLOGGING"} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-secondary">
        <div
          className={`h-full ${ok ? "bg-accent" : "bg-destructive"}`}
          style={{ width: `${Math.min(100, load)}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Load: {load.toFixed(0)}%
      </p>
    </Card>
  );
}

function FiltersPage() {
  const state = useSystemState();
  const polluted = state === "POLLUTED";
  const filtering = state === "FILTERING";
  const baseLoad = polluted ? 92 : filtering ? 60 : 25;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Filter Health Monitoring</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Real-time status of physical & chemical filtration stages.
      </p>

      {polluted && (
        <Card className="mt-4 border-destructive bg-destructive/10 p-4">
          <p className="font-mono text-sm text-destructive">
            ⚠ ALERT: Filter clogging detected — increase backwash cycle.
          </p>
        </Card>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-muted-foreground">
          Stage 1 — Physical Filtration
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <FilterCard name="Sponge Filter" load={baseLoad - 5} ok={!polluted} />
          <FilterCard name="Mesh Filter" load={baseLoad} ok={!polluted} />
          <FilterCard name="Sand Filter" load={baseLoad + 3} ok={!polluted} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-muted-foreground">
          Stage 2 — Chemical Adsorption
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FilterCard name="Activated Carbon" load={baseLoad - 10} ok={!polluted} />
          <FilterCard name="Ion Exchange" load={baseLoad - 15} ok={!polluted} />
        </div>
      </section>
    </main>
  );
}
