import { AlertTriangle, Clock } from "lucide-react";

interface AlertCardProps {
  title: string;
  description: string;
  time: string;
  onResolve?: () => void;
}

export default function AlertCard({ title, description, time, onResolve }: AlertCardProps) {
  return (
    <div className="card-glow rounded-xl bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-critical/20">
            <AlertTriangle size={16} className="text-critical" />
          </div>

          <div>
            {/* 👇 NAME */}
            <h4 className="text-sm font-semibold text-foreground">
              {title}
            </h4>

            {/* 👇 MESSAGE (THIS WAS MISSING) */}
            <p className="text-xs text-critical">
              {description}
            </p>

            {/* 👇 TIME */}
            <div className="mt-1 flex items-center gap-1 text-muted-foreground">
              <Clock size={10} />
              <span className="text-[11px]">{time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={onResolve}
          className="rounded-full border border-primary/50 px-3 py-1 text-xs text-primary hover:bg-primary/10"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}