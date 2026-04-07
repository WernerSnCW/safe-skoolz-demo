import { useState } from "react";
import { RotateCcw, Info, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const API_BASE = import.meta.env.VITE_API_URL || "";

export function DemoBanner() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isDemoMode) return null;

  const handleReset = async () => {
    setShowConfirm(false);
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
    <>
      <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Info size={16} className="shrink-0" />
            <span className="font-medium truncate">
              {message || "Demo Mode — Explore freely! Data can be reset anytime."}
            </span>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors text-xs font-semibold whitespace-nowrap"
          >
            <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} />
            {isResetting ? "Resetting..." : "Reset Data"}
          </button>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
              <RefreshCw size={28} className="text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Reset Demo Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed">
              This will restore all demo data to its original state — incidents, messages, diary entries, and everything else will be reset. You will be logged out and can log back in with any demo account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCcw size={16} className="mr-1.5" />
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
