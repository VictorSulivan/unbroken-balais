"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Periode } from "types/analyse";


// 1 semaine réelle = 1 semestre RP / 2 semaines réelles = 1 an RP
const PERIODES: { id: Periode; labelRp: string; labelReel: string }[] = [
  { id: "7j",    labelRp: "1 semestre",  labelReel: "7 jours"  },
  { id: "30j",   labelRp: "1 an",        labelReel: "14 jours" },
  { id: "90j",   labelRp: "3 ans",       labelReel: "42 jours" },
  { id: "annee", labelRp: "6 ans",       labelReel: "84 jours" },
  { id: "all",   labelRp: "Tout",        labelReel: ""         },
  { id: "custom",labelRp: "Plage libre", labelReel: ""         },
];

export function FiltrePeriode() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const currentPeriode = (searchParams.get("periode") ?? "30j") as Periode;
  const currentDebut   = searchParams.get("debut") ?? "";
  const currentFin     = searchParams.get("fin")   ?? "";

  const [debut, setDebut] = useState(currentDebut);
  const [fin,   setFin]   = useState(currentFin);

  function navigate(periode: Periode, d?: string, f?: string) {
    const p = new URLSearchParams();
    p.set("periode", periode);
    if (periode === "custom" && d && f) {
      p.set("debut", d);
      p.set("fin",   f);
    }
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs text-white/30 uppercase tracking-widest">Période</p>
        <span className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5">
          1 sem. réelle = 1 semestre RP
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODES.map(({ id, labelRp, labelReel }) => (
          <button
            key={id}
            onClick={() => navigate(id, debut, fin)}
            className={`flex flex-col items-start px-3 py-2 rounded-lg border transition-colors text-left ${
              currentPeriode === id
                ? "bg-[#a89af9]/15 border-[#a89af9]/40 text-[#a89af9]"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            <span className="text-xs font-medium">{labelRp}</span>
            {labelReel && (
              <span className={`text-[10px] ${currentPeriode === id ? "text-[#a89af9]/50" : "text-white/20"}`}>
                {labelReel} réels
              </span>
            )}
          </button>
        ))}
      </div>

      {currentPeriode === "custom" && (
        <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-white/5">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Du</label>
            <input
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a89af9]"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Au</label>
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a89af9]"
            />
          </div>
          <button
            onClick={() => navigate("custom", debut, fin)}
            disabled={!debut || !fin}
            className="bg-[#2a2250] hover:bg-[#3d3580] disabled:opacity-40 border border-[#3d3580] text-[#a89af9] text-sm rounded-lg px-4 py-2 font-medium transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}