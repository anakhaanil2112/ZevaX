interface WorkerAvatarProps {
  name: string;
  initial: string;
  color?: string;
  status?: "normal" | "warning" | "critical";
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  normal: "border-success",
  warning: "border-warning",
  critical: "border-critical",
};

const bgColors: Record<string, string> = {
  A: "bg-blue-600",
  R: "bg-purple-600",
  P: "bg-emerald-600",
  V: "bg-orange-600",
  L: "bg-slate-500",
  K: "bg-teal-600",
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-16 w-16 text-xl",
};

export default function WorkerAvatar({ initial, status = "normal", size = "md" }: WorkerAvatarProps) {
  return (
    <div className={`relative flex items-center justify-center rounded-full border-2 ${statusColors[status]} ${sizeClasses[size]} ${bgColors[initial] || "bg-primary"} font-bold text-foreground`}>
      {initial}
      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
        status === "normal" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-critical"
      }`} />
    </div>
  );
}
