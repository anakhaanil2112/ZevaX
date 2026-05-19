import { useState } from "react";
import { Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePassword() {
  const { changePassword, user } = useAuth();

  const [currentInput, setCurrentInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentInput || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await changePassword(
      user?.username || "admin",
      currentInput,
      newPassword
    );

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setCurrentInput("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(res.error || "Failed to update password");
    }
  };

  return (
    <div className="pb-24 lg:pb-0">
      <AppHeader />
      <div className="px-4 lg:px-0 max-w-lg">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Change Password</h2>
          <p className="text-xs text-muted-foreground">
            Update your account credentials
          </p>
        </div>

        <div className="card-glow rounded-xl bg-card p-6">

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success"
            >
              <CheckCircle size={16} />
              Password changed successfully!
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-critical/10 px-4 py-3 text-sm text-critical"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CURRENT PASSWORD */}
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="password"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="w-full rounded-lg bg-secondary py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg bg-secondary py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-secondary py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}