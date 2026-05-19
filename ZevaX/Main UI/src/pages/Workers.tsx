import { useState, useEffect } from "react";
import { Search, Users, ArrowLeft, Plus, CheckCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import WorkerAvatar from "@/components/WorkerAvatar";

import { db } from "@/firebase";
import { ref, set, onValue, remove } from "firebase/database";

export default function Workers() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [workerAlerts, setWorkerAlerts] = useState<any[]>([]);

  const [iotAll, setIotAll] = useState<any>({});
  const [iotData, setIotData] = useState<any>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");

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
      const data = snapshot.val();
      setIotAll(data || {});
    });
  }, []);

  // 🔥 FETCH HISTORY + IOT FOR SELECTED WORKER
  useEffect(() => {
    if (!selectedWorker) return;

    const historyRef = ref(db, `/history/${selectedWorker.id}`);
    const iotRef = ref(db, `/iot/${selectedWorker.id}`);

    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const logs = Object.keys(data)
          .map((key) => data[key])
          .reverse()
          .slice(0, 20);

        setWorkerAlerts(logs);
      } else {
        setWorkerAlerts([]);
      }
    });

    onValue(iotRef, (snapshot) => {
      const data = snapshot.val();
      setIotData(data || {});
    });

  }, [selectedWorker]);

  // 🔥 ADD WORKER
  const handleAddWorker = (e: any) => {
    e.preventDefault();

    if (!newName.trim() || !newId.trim()) return;

    set(ref(db, "workers/" + newId), {
      name: newName,
      empId: newId,
    });

    setNewName("");
    setNewId("");
    setShowAddForm(false);
    setSuccessMsg("Worker added successfully");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // 🔥 REMOVE WORKER
  const handleRemoveWorker = (id: string) => {
    remove(ref(db, `workers/${id}`));
  };

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase())
  );

  // 🔥 RESPONSE SUMMARY
  const totalResponses = Object.keys(iotAll).length;
  const activeResponses = Object.keys(iotAll).filter(
    (id) => iotAll[id]?.temperature !== undefined
  ).length;
  const inactiveResponses = workers.length - activeResponses;

  // 🔥 PROFILE VIEW
  if (selectedWorker) {
    return (
      <div className="pb-24 lg:pb-0">
        <AppHeader />

        <div className="px-4 lg:px-0">
          <button
            onClick={() => setSelectedWorker(null)}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="card-glow rounded-2xl bg-card p-8 lg:max-w-xl mx-auto">

            {/* PROFILE HEADER */}
            <div className="flex items-center gap-5 border-b border-border pb-4">
              <WorkerAvatar
                name={selectedWorker.name}
                initial={selectedWorker.initial}
                status="normal"
                size="lg"
              />

              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedWorker.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Employee ID: {selectedWorker.id}
                </p>
              </div>
            </div>

            {/* 🔥 DEVICE STATUS */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Device Status
              </p>

              {isDeviceActive(iotData) ? (
                <span className="text-xs text-success">🟢 Active</span>
              ) : (
                <span className="text-xs text-muted-foreground">🔴 Inactive</span>
              )}
            </div>

          

            {/* 🔥 VIOLATION HISTORY */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                Violation History (Last 20)
              </h3>

              {workerAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No violations recorded
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {workerAlerts.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-secondary px-3 py-2 text-sm border border-border"
                    >
                      <div className="font-medium text-foreground">
                        ⚠ {a.message}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {a.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REMOVE BUTTON */}
            <button
              onClick={() => {
                handleRemoveWorker(selectedWorker.id);
                setSelectedWorker(null);
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-critical/20 px-4 py-2 text-sm text-critical hover:bg-critical/30"
            >
              <Trash2 size={14} /> Remove Worker
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />

      <div className="px-4 lg:px-0">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Worker Management</h2>
            <p className="text-xs text-muted-foreground">
              Add and manage workers
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs text-white hover:bg-primary/90"
          >
            <Plus size={14} /> Add Worker
          </button>
        </div>

        {/* SUCCESS */}
        {successMsg && (
          <motion.div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle size={16} /> {successMsg}
          </motion.div>
        )}

        {/* FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              onSubmit={handleAddWorker}
              className="mb-4 card-glow rounded-xl bg-card p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Worker name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="rounded-lg bg-secondary px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Employee ID (emp001)"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  required
                  className="rounded-lg bg-secondary px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs text-white"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg bg-accent px-4 py-2 text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

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

        {/* COUNT */}
        <div className="mb-4 card-glow rounded-xl bg-card p-3 inline-flex items-center gap-2">
          <Users size={16} />
          <span className="text-xl font-bold">{workers.length}</span>
          <span className="text-xs text-muted-foreground">
            Total Workers
          </span>
        </div>

      

        {/* LIST */}
        {workers.length === 0 ? (
          <div className="card-glow rounded-xl bg-card p-8 text-center">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No workers added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((w) => (
              <motion.button
                key={w.id}
                onClick={() => setSelectedWorker(w)}
                className="card-glow rounded-xl bg-card p-4 hover:bg-accent"
              >
                <div className="flex flex-col items-center gap-2">
                  <WorkerAvatar name={w.name} initial={w.initial} status="normal" />
                  <span className="text-xs font-semibold">{w.name}</span>
                  <span className="text-[10px] text-muted-foreground">{w.id}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}