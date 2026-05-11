import { Link, useLocation } from "@tanstack/react-router";
import { useSystemState } from "@/lib/system-state";

const links = [
  { to: "/", label: "Overview" },
  { to: "/analytics", label: "Analytics" },
  { to: "/filters", label: "Filter Health" },
  { to: "/specs", label: "Tech Specs" },
];

export function NavBar() {
  const state = useSystemState();
  const loc = useLocation();
  const dotColor =
    state === "CLEAN"
      ? "bg-accent"
      : state === "FILTERING"
        ? "bg-chart-4"
        : state === "POLLUTED"
          ? "bg-destructive"
          : "bg-muted-foreground";

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent">⚙</span> FILTER FIGHTERS
          <span className="text-xs text-muted-foreground">// UNO Team</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <span className={`ml-3 inline-block h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
          <span className="font-mono text-xs text-muted-foreground">{state}</span>
        </nav>
      </div>
    </header>
  );
}
