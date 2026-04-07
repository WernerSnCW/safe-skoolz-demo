import { useState } from "react";
import { RotateCcw, Info } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export function DemoBanner() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isDemoMode) return null;

  const handleReset = async () => {
    if (isResetting) return;
    if (!window.confirm("Reset all demo data to its original state? You will be logged out.")) return;

    setIsResetting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/demo/reset`, { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      setMessage("Demo data reset! Logging out...");
      setTimeout(() => {
        localStorage.removeItem("safeschool_token");
        window.location.href = "/login";
      }, 1500);
    } catch {
      setMessage("Reset failed. Please try again.");
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Info size={16} className="shrink-0" />
          <span className="font-medium truncate">
            {message || "Demo Mode — Explore freely! Data can be reset anytime."}
          </span>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors text-xs font-semibold whitespace-nowrap"
        >
          <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} />
          {isResetting ? "Resetting..." : "Reset Data"}
        </button>
      </div>
    </div>
  );
}
