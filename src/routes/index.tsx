import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Dashboard } from "@/components/dashboard";
import { todayJalaali } from "@/lib/jalali";
import { useDesk } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useEffect(() => {
    void (async () => {
      try {
        await useDesk.persist.rehydrate();
      } catch {
        return;
      }
      if (!localStorage.getItem("rokhsat-desk")) {
        const today = todayJalaali();
        useDesk.getState().setView(today.jy, today.jm);
      }
    })();
  }, []);

  return <Dashboard />;
}
