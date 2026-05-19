import { Users, ShieldCheck, AlertTriangle, Watch } from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import StatCard from "@/components/StatCard";
import AlertCard from "@/components/AlertCard";
import { useAppState } from "@/contexts/AppStateContext";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

import { db } from "@/firebase";
import { ref, onValue, remove } from "firebase/database";

export default function Dashboard() {
  const { wristbands } = useAppState();
  const navigate = useNavigate();

  const [firebaseAlerts, setFirebaseAlerts] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any>({});
  const [iotData, setIotData] = useState<any>({});

  // 🔥 VALIDATION FUNCTION
  const isValid = (v: any) => {
    if (v === "" || v === null || v === undefined) return false;
    const num = Number(v);
    return !isNaN(num) && num > 0;
  };

  const isDeviceActive = (device: any) => {
    return (
      device &&
      (
        isValid(device.temperature) ||
        isValid(device.heartRate) ||
        isValid(device.spo2)
      )
    );
  };

  // 🔥 FETCH DATA
  useEffect(() => {
    const alertsRef = ref(db, "/alerts");
    const workersRef = ref(db, "/workers");
    const iotRef = ref(db, "/iot");

    // ALERTS
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          empId: data[key].empId,
          message: data[key].message || "Violation detected",
          time: data[key].time || "",
        }));

        setFirebaseAlerts(formatted);
      } else {
        setFirebaseAlerts([]);
      }
    });

    // WORKERS
    onValue(workersRef, (snapshot) => {
      const data = snapshot.val();
      setWorkers(data || {});
    });

    // IOT
    onValue(iotRef, (snapshot) => {
      const data = snapshot.val();
      setIotData(data || {});
    });

  }, []);

  // 🔥 RESOLVE ALERT
  const handleResolve = (id: string) => {
    remove(ref(db, `/alerts/${id}`));
  };

  // 🔥 CALCULATIONS

  // TOTAL DEVICES (for Workers Online)
  const totalDevices = Object.keys(iotData).length;

  // ONLY VALID DEVICES (for Responses)
  const activeResponses = Object.keys(iotData).filter((id) =>
    isDeviceActive(iotData[id])
  ).length;

  // ALERTS + COMPLIANCE
  const totalWorkers = Object.keys(workers).length;

const violatingWorkers = new Set(
  firebaseAlerts
    .filter((a) => (a.message || "").toLowerCase().includes("no"))
    .map((a) => a.empId)
);

const compliantWorkers = totalWorkers - violatingWorkers.size;

const compliance =
  totalWorkers === 0
    ? 100
    : Math.round((compliantWorkers / totalWorkers) * 100);

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />

      <div className="space-y-6 px-4 lg:px-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* 🔥 WORKERS ONLINE */}
          <StatCard
            icon={Users}
            label="Workers Online"
            value={totalDevices}
            subtitle="IoT Connected"
          />

          {/* PPE */}
          <StatCard
            icon={ShieldCheck}
            label="PPE Compliance"
            value={`${compliance}%`}
            variant="success"
          />

          {/* ALERTS */}
          <StatCard
            icon={AlertTriangle}
            label="Active Alerts"
            value={`${firebaseAlerts.length}`}
            subtitle="Require attention"
            variant="warning"
          />

          {/* 🔥 RESPONSES (FIXED) */}
          <StatCard
            icon={Watch}
            label="Responses"
            value={activeResponses}
            subtitle="Valid IoT data"
          />
        </div>

        {/* Alerts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
            <button
              onClick={() => navigate("/alerts")}
              className="text-xs font-medium text-primary"
            >
              See All
            </button>
          </div>

          {firebaseAlerts.length === 0 ? (
            <div className="card-glow rounded-xl bg-card p-8 text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No active alerts</p>
              <p className="text-xs text-muted-foreground/70">
                Alerts will appear here when IoT devices are connected
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {firebaseAlerts.slice(0, 3).map((a, i) => {
                const workerName = workers[a.empId]?.name || "Unknown";

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <AlertCard
                      title={`${workerName} (${a.empId})`}
                      worker={a.message}
                      time={a.time}
                      type="PPE Violation"
                      onResolve={() => handleResolve(a.id)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}