"use client";

import { Employe } from "@prisma/client";

export default function FormEquipe({ employes, responsableId, selectedEmployes, onResponsableChange, onToggleEmploye }: { employes: Employe[]; responsableId: string; selectedEmployes: number[]; onResponsableChange: (id: string) => void; onToggleEmploye: (id: number) => void }) {
  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Équipe</p>
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Responsable</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
          {employes.map((e) => (
            <button key={e.id} type="button" onClick={() => onResponsableChange(responsableId === e.id.toString() ? "" : e.id.toString())}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${responsableId === e.id.toString() ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"}`}>
              {e.prenom} {e.nom}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Employés présents</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
          {employes.map((e) => (
            <button key={e.id} type="button" onClick={() => onToggleEmploye(e.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${selectedEmployes.includes(e.id) ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"}`}>
              {e.prenom} {e.nom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}