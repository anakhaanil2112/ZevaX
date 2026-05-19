import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface Worker {
  name: string;
  initial: string;
  bpm: number;
  temp: number;
  spo2: number;
  status: "normal" | "warning" | "critical";
  id: string;
}

export interface Alert {
  id: string;
  title: string;
  worker: string;
  time: string;
  type: "PPE Violation" | "Health Risk";
}

export interface Wristband {
  id: string;
  workerId: string;
  workerName: string;
  status: "active" | "inactive";
  battery: number;
  lastSync: string;
}

interface AppState {
  workers: Worker[];
  alerts: Alert[];
  wristbands: Wristband[];
  addWorker: (name: string, employeeId: string) => void;
  removeWorker: (id: string) => void;
  resolveAlert: (id: string) => void;
  toggleWristband: (id: string) => void;
  password: string;
  changePassword: (current: string, newPass: string, confirm: string) => { success: boolean; error?: string };
}

const defaultWorkers: Worker[] = [];

const defaultAlerts: Alert[] = [];

const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>(defaultWorkers);
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts);
  const [password, setPassword] = useState("admin123");

  // Wristbands are derived from workers
  const wristbands: Wristband[] = workers.map((w) => ({
    id: w.id,
    workerId: w.id,
    workerName: w.name,
    status: "active" as const,
    battery: 80 + Math.floor(Math.random() * 20),
    lastSync: "Just now",
  }));

  const [wristbandOverrides, setWristbandOverrides] = useState<Record<string, "active" | "inactive">>({});

  const derivedWristbands: Wristband[] = wristbands.map((wb) => ({
    ...wb,
    status: wristbandOverrides[wb.id] || wb.status,
  }));

  const addWorker = useCallback((name: string, employeeId: string) => {
    const newWorker: Worker = {
      name,
      initial: name.charAt(0).toUpperCase(),
      bpm: 0,
      temp: 0,
      spo2: 0,
      status: "normal",
      id: employeeId,
    };
    setWorkers((prev) => [...prev, newWorker]);
  }, []);

  const removeWorker = useCallback((id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setWristbandOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleWristband = useCallback((id: string) => {
    setWristbandOverrides((prev) => ({
      ...prev,
      [id]: prev[id] === "inactive" ? "active" : "inactive",
    }));
  }, []);

  const changePassword = useCallback((current: string, newPass: string, confirm: string) => {
    if (current !== password) {
      return { success: false, error: "Current password is incorrect" };
    }
    if (newPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }
    if (newPass !== confirm) {
      return { success: false, error: "Passwords do not match" };
    }
    setPassword(newPass);
    return { success: true };
  }, [password]);

  return (
    <AppStateContext.Provider value={{ workers, alerts, wristbands: derivedWristbands, addWorker, removeWorker, resolveAlert, toggleWristband, password, changePassword }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
