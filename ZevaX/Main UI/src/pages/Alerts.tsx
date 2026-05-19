import { useState, useEffect } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import AlertCard from "@/components/AlertCard";

import { db } from "@/firebase";
import { ref, onValue, remove } from "firebase/database";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any>({});
  const [search, setSearch] = useState("");

  // 🔥 FETCH ALERTS + WORKERS
  useEffect(() => {
    const alertsRef = ref(db, "/alerts");
    const workersRef = ref(db, "/workers");

    // 🔥 ALERTS
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {

        const rawAlerts = Object.keys(data).map((key) => ({
          id: key,
          empId: data[key].empId,
          message: data[key].message || "Violation detected",
          time: data[key].time || "",
        }));

        // 🔥 REMOVE EXACT DUPLICATES
        const formatted = rawAlerts.filter(
          (alert, index, self) =>
            index ===
            self.findIndex(
              (a) =>
                a.empId === alert.empId &&
                a.message === alert.message &&
                a.time === alert.time
            )
        );

        setAlerts(formatted);

      } else {
        setAlerts([]);
      }
    });

    // 🔥 WORKERS
    onValue(workersRef, (snapshot) => {
      const data = snapshot.val();
      setWorkers(data || {});
    });

  }, []);

  // 🔥 DELETE ALERT
  const handleResolve = (id: string) => {
    remove(ref(db, `/alerts/${id}`));
  };

  // 🔍 SEARCH
  const filtered = alerts.filter((a) =>
    (
      a.message ||
      ""
    ).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />

      <div className="px-4 lg:px-0">

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">
            Active Alerts
          </h2>

          <p className="text-xs text-muted-foreground">
            Monitor and manage safety alerts
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />

          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-card py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        {/* COUNT */}
        <div className="mb-6 grid grid-cols-2 gap-3">

          <div className="gradient-warning rounded-xl p-3">
            <p className="text-2xl font-bold">
              {alerts.length}
            </p>

            <p className="text-[11px]">
              Total Alerts
            </p>
          </div>

          <div className="gradient-critical rounded-xl p-3">
            <p className="text-2xl font-bold">
              {
                alerts.filter(
                  (a) =>
                    (a.message || "")
                      .toLowerCase()
                      .includes("hardhat") ||

                    (a.message || "")
                      .toLowerCase()
                      .includes("mask")
                ).length
              }
            </p>

            <p className="text-[11px]">
              PPE Violations
            </p>
          </div>

        </div>

        {/* LIST */}
        {filtered.length === 0 ? (

          <div className="card-glow rounded-xl bg-card p-8 text-center">
            <AlertTriangle
              size={24}
              className="mx-auto mb-2 text-muted-foreground/50"
            />

            <p className="text-sm text-muted-foreground">
              No active alerts
            </p>
          </div>

        ) : (

          <div className="grid gap-3 lg:grid-cols-2">

            {filtered.map((a, i) => {

              const workerName =
                workers[a.empId]?.name || "Unknown";

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >

                  <AlertCard
                    title={`${workerName} (${a.empId})`}
                    description={`Violation: ${a.message}`}
                    time={a.time}
                    onResolve={() => handleResolve(a.id)}
                  />

                </motion.div>
              );
            })}

          </div>

        )}
      </div>
    </div>
  );
}