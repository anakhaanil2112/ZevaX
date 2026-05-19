interface DeviceCardProps {
  name: string;
  id: string;
  zone: string;
  lastPing: string;
  battery?: number;
  status: "online" | "offline";
}

export default function DeviceCard({ name, id, zone, lastPing, battery, status }: DeviceCardProps) {
  return (
    <div className="card-glow rounded-xl bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <div className="h-5 w-5 rounded border-2 border-muted-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{name}</h4>
            <p className="text-[11px] text-muted-foreground">{id}</p>
            <p className="text-[11px] text-muted-foreground">📍 {zone}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          status === "online" ? "bg-success/20 text-success" : "bg-critical/20 text-critical"
        }`}>
          {status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Last ping: {lastPing}</span>
        {battery !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${battery > 50 ? "bg-primary" : battery > 20 ? "bg-warning" : "bg-critical"}`}
                style={{ width: `${battery}%` }}
              />
            </div>
            <span className="tabular-nums">{battery}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
