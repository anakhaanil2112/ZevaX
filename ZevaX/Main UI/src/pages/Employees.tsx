import { useState, useEffect } from "react";
import { Search, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import WorkerAvatar from "@/components/WorkerAvatar";

import { db } from "@/firebase";
import { ref, onValue } from "firebase/database";

export default function Employees() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);

  const [iotAll, setIotAll] = useState<any>({});
  const [iotData, setIotData] = useState<any>({});

  // 🔥 FETCH WORKERS
  useEffect(() => {
    const workersRef = ref(db, "/workers");

    onValue(workersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
          initial: data[key].name?.charAt(0) || "W",
        }));
        setWorkers(formatted);
      } else {
        setWorkers([]);
      }
    });
  }, []);

  // 🔥 FETCH ALL IOT
  useEffect(() => {
    const iotRef = ref(db, "/iot");

    onValue(iotRef, (snapshot) => {
      setIotAll(snapshot.val() || {});
    });
  }, []);

  // 🔥 FETCH SELECTED WORKER DATA
  useEffect(() => {
    if (!selectedWorker) return;

    const iotRef = ref(db, `/iot/${selectedWorker.id}`);
    const logsRef = ref(db, `/healthLogs/${selectedWorker.id}`);

    onValue(iotRef, (snap) => {
      setIotData(snap.val() || {});
    });

    onValue(logsRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).reverse().slice(0, 20);
      setHealthLogs(arr);
    });

  }, [selectedWorker]);

  // 🔥 STATUS LOGIC
  const getStatus = (temp: number) => {
    if (!temp || temp === 0) return "nodata";
    if (temp > 100.4) return "critical";
    if (temp > 99.5) return "warning";
    return "normal";
  };

  // 🔥 PROFILE VIEW
  if (selectedWorker) {
    const temp = iotData.temperature;
    const status = getStatus(temp);

    return (
      <div className="pb-24">
        <AppHeader />

        <div className="px-4">
          <button
            onClick={() => setSelectedWorker(null)}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="card-glow rounded-2xl bg-card p-8 max-w-xl mx-auto">

            {/* PROFILE */}
            <div className="flex items-center gap-5 border-b border-border pb-4">
              <WorkerAvatar
                name={selectedWorker.name}
                initial={selectedWorker.initial}
                size="lg"
              />

              <div>
                <h2 className="text-xl font-bold">
                  {selectedWorker.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Employee ID: {selectedWorker.id}
                </p>
              </div>
            </div>

            {/* 🔥 HEALTH STATUS */}
            <div className="mt-4">
              <p className="text-sm font-semibold">Health Status</p>

              <span className={
                status === "critical"
                  ? "text-red-500"
                  : status === "warning"
                  ? "text-yellow-500"
                  : status === "normal"
                  ? "text-green-500"
                  : "text-gray-400"
              }>
                {status === "nodata"
                  ? "Not Detected"
                  : status.toUpperCase()}
              </span>
            </div>

            {/* 🔥 TEMPERATURE */}
            <div className="mt-2">
              <p className="text-sm font-semibold">Temperature</p>

              <p className="text-lg font-bold">
                {temp ? `${temp} °F` : "Not Detected"}
              </p>
            </div>

            {/* 🔥 HEALTH LOGS */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">
                Health Logs (Last 20)
              </h3>

              {healthLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No health data
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {healthLogs.map((log: any, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-secondary px-3 py-2 border"
                    >
                      <div className="font-medium">
                        🌡 {log.temp} °F
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {log.time}
                      </div>

                      <div className={
                        log.status === "critical"
                          ? "text-red-500 text-xs"
                          : log.status === "warning"
                          ? "text-yellow-500 text-xs"
                          : "text-green-500 text-xs"
                      }>
                        {log.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 🔥 LIST VIEW
  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24">
      <AppHeader />

      <div className="px-4">

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="text-lg font-bold">Employee Health Monitoring</h2>
        </div>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-card py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        {/* LIST */}
        {workers.length === 0 ? (
          <div className="card-glow rounded-xl bg-card p-8 text-center">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
            <p>No workers added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((w) => {

              const temp = iotAll[w.id]?.temperature;
              const status = getStatus(temp);

              return (
                <motion.button
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className="card-glow rounded-xl bg-card p-4 hover:bg-accent"
                >
                  <div className="flex flex-col items-center gap-2">

                    <WorkerAvatar
                      name={w.name}
                      initial={w.initial}
                    />

                    <span className="text-xs font-semibold">
                      {w.name}
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                      {w.id}
                    </span>

                    <span className="text-xs">
                      {temp ? `${temp} °F` : "Not Detected"}
                    </span>

                    <span className={
                      status === "critical"
                        ? "text-red-500 text-xs"
                        : status === "warning"
                        ? "text-yellow-500 text-xs"
                        : status === "normal"
                        ? "text-green-500 text-xs"
                        : "text-gray-400 text-xs"
                    }>
                      {status === "nodata"
                        ? "Not Detected"
                        : status.toUpperCase()}
                    </span>

                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}