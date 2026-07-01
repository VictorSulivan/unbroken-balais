"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  employeId: number;
  acceesCompta: boolean;
  acceesIllegal: boolean;
};

export default function AccesHabilitations({ employeId, acceesCompta, acceesIllegal }: Props) {
  const router = useRouter();
  const [compta, setCompta] = useState(acceesCompta);
  const [illegal, setIllegal] = useState(acceesIllegal);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(field: "acceesCompta" | "acceesIllegal", value: boolean) {
    setLoading(field);
    try {
      const res = await fetch(`/api/employes/${employeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        if (field === "acceesCompta") setCompta(value);
        if (field === "acceesIllegal") setIllegal(value);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Accès & Habilitations</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Accès compta légale</p>
            <p className="text-xs text-white/30 mt-0.5">Voir Gringotts et les transactions légales</p>
          </div>
          <button
            onClick={() => toggle("acceesCompta", !compta)}
            disabled={loading !== null}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              compta ? "bg-[#a89af9]" : "bg-white/10"
            } disabled:opacity-50`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              compta ? "left-6" : "left-1"
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Accès compta illégale</p>
            <p className="text-xs text-white/30 mt-0.5">Voir et créer des produits/ventes illégaux</p>
          </div>
          <button
            onClick={() => toggle("acceesIllegal", !illegal)}
            disabled={loading !== null}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              illegal ? "bg-red-500" : "bg-white/10"
            } disabled:opacity-50`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              illegal ? "left-6" : "left-1"
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
