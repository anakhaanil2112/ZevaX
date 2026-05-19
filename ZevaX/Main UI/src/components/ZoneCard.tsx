interface ZoneCardProps {
  name: string;
  workers: number;
  compliance: number;
  alerts: number;
}

export default function ZoneCard({ name, workers, compliance, alerts }: ZoneCardProps) {
  const compColor = compliance >= 95 ? "bg-success text-success-foreground" : compliance >= 85 ? "bg-warning text-warning-foreground" : "bg-critical text-critical-foreground";

  return (
    <div className="card-glow rounded-xl bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{name}</h4>
          <p className="text-[11px] text-muted-foreground">{workers} workers active</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${compColor}`}>
          {compliance}% PPE
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-1 text-[11px] text-muted-foreground">Compliance</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${compliance >= 95 ? "gradient-success" : compliance >= 85 ? "gradient-warning" : "gradient-critical"}`}
              style={{ width: `${compliance}%` }}
            />
          </div>
        </div>
        <div className="ml-6 text-right">
          <p className={`text-xl font-bold tabular-nums ${alerts > 0 ? "text-warning" : "text-muted-foreground"}`}>{alerts}</p>
          <p className="text-[11px] text-muted-foreground">Alerts</p>
        </div>
      </div>
    </div>
  );
}
