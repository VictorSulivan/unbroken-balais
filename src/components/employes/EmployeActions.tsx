"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployeActions({ id, actif }: { id: number; actif: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActif() {
    setLoading(true);
    await fetch(`/api/employes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !actif }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <a href={`/dashboard/employes/${id}`}
        className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors">
        Voir
      </a>
      <button onClick={toggleActif} disabled={loading}
        className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors disabled:opacity-30">
        {actif ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
