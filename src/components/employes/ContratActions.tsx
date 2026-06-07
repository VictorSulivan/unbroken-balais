"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContratActions({ id, estActif }: { id: number; estActif: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/contrats/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estActif: !estActif }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="text-xs text-white/30 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors disabled:opacity-30 shrink-0">
      {estActif ? "Résilier" : "Réactiver"}
    </button>
  );
}
