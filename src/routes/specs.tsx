import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/specs")({
  head: () => ({
    meta: [
      { title: "Tech Specs — Filter Fighters" },
      { name: "description", content: "Hardware specifications for the Filter Fighters IoT system." },
    ],
  }),
  component: SpecsPage,
});

const sensors = [
  { name: "PM2.5 Sensor", purpose: "Particulate matter in air" },
  { name: "MQ-135", purpose: "Air quality (NOx, CO₂, smoke)" },
  { name: "TDS Sensor", purpose: "Dissolved solids in water" },
  { name: "Soil Moisture", purpose: "Smart irrigation feedback" },
];

const actuators = [
  { name: "Ventilation Fans", purpose: "Pull air through filtration stack" },
  { name: "Water Pumps", purpose: "Push wastewater through filters" },
  { name: "Solenoid Valves", purpose: "Direct flow to irrigation" },
];

function SpecsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Technical Specifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hardware powering the Filter Fighters IoT ecosystem.
      </p>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold">Microcontroller</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="font-mono text-2xl text-accent">ESP32</p>
            <p className="text-xs text-muted-foreground">
              Dual-core 240 MHz · Wi-Fi + Bluetooth · 36 GPIO
            </p>
          </div>
          <ul className="text-sm text-muted-foreground">
            <li>• MQTT telemetry every 2s</li>
            <li>• Relay control for fans & pumps</li>
            <li>• OTA firmware updates</li>
          </ul>
        </div>
      </Card>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Sensors</h2>
          <ul className="space-y-2">
            {sensors.map((s) => (
              <li
                key={s.name}
                className="flex justify-between border-b border-border/60 pb-2 last:border-0"
              >
                <span className="font-mono text-sm">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.purpose}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Actuators</h2>
          <ul className="space-y-2">
            {actuators.map((a) => (
              <li
                key={a.name}
                className="flex justify-between border-b border-border/60 pb-2 last:border-0"
              >
                <span className="font-mono text-sm">{a.name}</span>
                <span className="text-xs text-muted-foreground">{a.purpose}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold">Project Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Built by <span className="text-foreground">UNO Team</span> — a student project
          exploring sustainable cement-factory air & water purification.
        </p>
      </Card>
    </main>
  );
}
