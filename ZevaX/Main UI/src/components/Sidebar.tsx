import { Home, Users, AlertTriangle, Watch, Heart, Lock, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/workers", label: "Workers", icon: Users },
  { path: "/employees", label: "Employee Health", icon: Heart },
  { path: "/alerts", label: "Alerts", icon: AlertTriangle },
  { path: "/wristbands", label: "Wristbands", icon: Watch },
  { path: "/change-password", label: "Change Password", icon: Lock },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border z-50">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
          <img src="/Logo.png" alt="logo" className="h-10 w-10 object-contain" />
          <div className="h-3 w-3 rounded-full border-2 border-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">ZevaX</h1>
          <p className="text-[10px] text-muted-foreground">Smart Safety Access</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-critical transition-colors hover:bg-critical/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
