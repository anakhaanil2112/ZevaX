import { Watch, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { ref, onValue } from "firebase/database";

export default function Wristbands() {

  const [iotData, setIotData] = useState<any>({});

  // 🔥 FETCH IOT DATA
  useEffect(() => {
    const iotRef = ref(db, "/iot");

    onValue(iotRef, (snapshot) => {
      const data = snapshot.val();
      setIotData(data || {});
    });
  }, []);

  // 🔥 STRICT VALIDATION FUNCTION
  const isValid = (v: any) => {
    if (v === "" || v === null || v === undefined) return false;

    const num = Number(v);
    return !isNaN(num) && num > 0;
  };

  // 🔥 CALCULATIONS
  const total = Object.keys(iotData).length;

  const active = Object.keys(iotData).filter((id) => {
    const d = iotData[id];

    return (
      d &&
      (
        isValid(d.temperature) ||
        isValid(d.heartRate) ||
        isValid(d.spo2)
      )
    );
  }).length;

  const inactive = total - active;

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />

      <div className="px-4 lg:px-0">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Response Devices</h2>
          <p className="text-xs text-muted-foreground">
            Monitor connected IoT devices
          </p>
        </div>

        {/* 🔥 STATS */}
        <div className="mb-6 grid grid-cols-3 gap-4">

          {/* TOTAL */}
          <div className="gradient-primary rounded-xl p-4">
            <Watch size={18} className="mb-1 text-foreground/80" />
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-foreground/80">Total Devices</p>
          </div>

          {/* ACTIVE */}
          <div className="card-glow rounded-xl bg-card p-4">
            <Wifi size={18} className="mb-1 text-success" />
            <p className="text-2xl font-bold text-foreground">{active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>

          {/* INACTIVE */}
          <div className="card-glow rounded-xl bg-card p-4">
            <WifiOff size={18} className="mb-1 text-critical" />
            <p className="text-2xl font-bold text-foreground">{inactive}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </div>

        </div>

        {/* 🔥 EMPTY STATE */}
        {total === 0 ? (
          <div className="card-glow rounded-xl bg-card p-8 text-center">
            <Watch size={24} className="mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No IoT devices connected</p>
            <p className="text-xs text-muted-foreground/70">
              Connect ESP32 to Firebase to see devices
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {Object.keys(iotData).map((id, i) => {
              const device = iotData[id];

              // 🔥 ACTIVE CHECK
              const isActive =
                device &&
                (
                  isValid(device.temperature) ||
                  isValid(device.heartRate) ||
                  isValid(device.spo2)
                );

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-glow rounded-xl bg-card p-4"
                >
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isActive ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Watch
                          size={20}
                          className={isActive ? "text-primary" : "text-muted-foreground"}
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {id}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          IoT Device
                        </p>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-success/20 text-success"
                        : "bg-critical/20 text-critical"
                    }`}>
                      {isActive ? "active" : "inactive"}
                    </span>

                  </div>
                </motion.div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}