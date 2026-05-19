import { useState } from "react";
import { Heart, Thermometer, LogOut, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const [maxTemp, setMaxTemp] = useState(38);
  const [minHR, setMinHR] = useState(50);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />
      <div className="space-y-4 px-4 lg:px-0 lg:max-w-2xl">
        <h2 className="text-lg font-bold text-foreground">Settings</h2>

        <div className="card-glow rounded-xl bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Alert Thresholds</h3>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Thermometer size={16} className="text-critical" /> Max Temperature
              </div>
              <span className="text-sm font-bold text-primary tabular-nums">{maxTemp}°C</span>
            </div>
            <input type="range" min={35} max={42} value={maxTemp} onChange={(e) => setMaxTemp(Number(e.target.value))} className="w-full accent-primary" />
            <p className="mt-1 text-[11px] text-muted-foreground">Alert when body temperature exceeds threshold</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Heart size={16} className="text-critical" /> Min Heart Rate
              </div>
              <span className="text-sm font-bold text-primary tabular-nums">{minHR} BPM</span>
            </div>
            <input type="range" min={40} max={80} value={minHR} onChange={(e) => setMinHR(Number(e.target.value))} className="w-full accent-primary" />
            <p className="mt-1 text-[11px] text-muted-foreground">Alert when heart rate is too low</p>
          </div>
        </div>

        <div className="card-glow rounded-xl bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Info size={16} className="text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">System Information</h3>
          </div>
          {[
            { label: "Version", value: "v2.4.1" },
            { label: "Build", value: "20241021" },
            { label: "AI Model", value: "YOLOv8n" },
            { label: "Database", value: "Not Connected", color: "text-muted-foreground" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`text-sm font-medium ${item.color || "text-foreground"}`}>{item.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-critical/20 py-3 text-sm font-semibold text-critical transition-colors hover:bg-critical/30 lg:hidden"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
