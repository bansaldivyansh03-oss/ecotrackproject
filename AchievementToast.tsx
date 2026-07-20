"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

export default function AchievementToast() {
  const lastUnlocked = useAppStore((s) => s.lastUnlocked);
  const clearLastUnlocked = useAppStore((s) => s.clearLastUnlocked);
  const [visibleId, setVisibleId] = useState<string | null>(null);

  useEffect(() => {
    if (lastUnlocked.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to external zustand store event
      setVisibleId(lastUnlocked[0]);
      const t = setTimeout(() => {
        setVisibleId(null);
        clearLastUnlocked();
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [lastUnlocked, clearLastUnlocked]);

  const def = ACHIEVEMENT_DEFS.find((a) => a.id === visibleId);

  return (
    <AnimatePresence>
      {def && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-canopy text-mist px-4 py-3 shadow-xl border border-lichen/30">
            <div className="h-10 w-10 rounded-full bg-lichen/20 flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-lichen" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-lichen">Achievement unlocked</p>
              <p className="font-semibold text-sm">{def.title}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
