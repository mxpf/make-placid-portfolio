"use client";

import { useEffect, useState } from "react";

export function useAutoplayPermission(enabled: boolean) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [enabled]);

  return enabled && allowed;
}
