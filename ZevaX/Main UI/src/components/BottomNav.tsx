import { Home, Users, AlertTriangle, Watch } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/workers", label: "Workers", icon: Users },
  { path: "/alerts", label: "Alerts", icon: AlertTriangle },
  { path: "/wristbands", label: "Bands", icon: Watch },
  
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon
                size={20}
                className={active ? "text-primary" : "text-muted-foreground"}
                strokeWidth={active ? 2.2 : 1.5}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
