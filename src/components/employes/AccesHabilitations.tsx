"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  employeId: number;
  acceesIllegal: boolean;
};

export default function AccesHabilitations({ employeId, acceesIllegal }: Props) {
  const router = useRouter();
  const [illegal, setIllegal] = useState(acceesIllegal);
  const [loading, setLoading] = useState(false);

  async function toggle(value: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/employes/${employeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceesIllegal: value }),
      });
      if (res.ok) {
        setIllegal(value);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Accès & Habilitations</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white">Accès Gringotts illégal</p>
          <p className="text-xs text-white/30 mt-0.5">Voir et créer des produits/ventes illégaux</p>
        </div>
        <button
          onClick={() => toggle(!illegal)}
          disabled={loading}
          className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
            illegal ? "bg-red-500" : "bg-white/10"
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            illegal ? "left-6" : "left-1"
          }`} />
        </button>
      </div>
    </div>
  );
}
