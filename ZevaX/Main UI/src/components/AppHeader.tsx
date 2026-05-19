import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const mobileNav = [
  { path: "/", label: "Dashboard" },
  { path: "/workers", label: "Workers" },
  { path: "/employees", label: "Health" },
  { path: "/alerts", label: "Alerts" },
  { path: "/wristbands", label: "Wristbands" },
  
  { path: "/change-password", label: "Password" },
];

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-4 lg:px-0 lg:py-0 lg:mb-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-accent" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary">
              <div className="h-2.5 w-2.5 rounded-full border-2 border-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">ZevaX</h1>
              <p className="text-[10px] text-muted-foreground">Smart Safety Access</p>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 lg:hidden"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
                  <div className="h-3 w-3 rounded-full border-2 border-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">ZevaX</h1>
                  <p className="text-[10px] text-muted-foreground">Smart Safety Access</p>
                </div>
              </div>
              <nav className="space-y-1">
                {mobileNav.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className={`w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-medium text-critical hover:bg-critical/10"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
