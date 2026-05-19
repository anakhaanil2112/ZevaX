import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "critical";
  progress?: number;
}

export default function StatCard({ icon: Icon, label, value, subtitle, variant = "default", progress }: StatCardProps) {
  const iconColorMap = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    critical: "text-critical",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow rounded-xl bg-card p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon size={18} className={iconColorMap[variant]} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full gradient-primary"
          />
        </div>
      )}
    </motion.div>
  );
}
