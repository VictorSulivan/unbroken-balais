"use client";

import { Client } from "@prisma/client";
import { useState } from "react";

// --- 1. COMPOSANT : MODALE CRÉATION CLIENT ---
export default function NouveauClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Client) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nom: "", prenom: "", typeClient: "particulier", entrepriseClienteNom: "" });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit() {
    if (!form.nom) return setError("Le nom est requis");
    setLoading(true); setError("");
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { onCreated(await res.json()); }
    else { const d = await res.json(); setError(d.error ?? "Erreur"); setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#16162a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium text-lg">Nouveau client</h2>
            <p className="text-white/40 text-xs mt-0.5">Ajouter au registre et l&apos;ajouter à l&apos;événement</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">✕</button>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Type de client</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: "particulier", label: "👤  Particulier" }, { value: "entreprise", label: "🏢  Entreprise" }].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set("typeClient", value)}
                className={`py-2.5 rounded-lg text-sm border transition-colors ${form.typeClient === value ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-white/40 mb-1.5">Prénom</label><input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="input-dark" placeholder="Michael" autoFocus /></div>
          <div><label className="block text-xs text-white/40 mb-1.5">Nom</label><input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" placeholder="De Santa" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /></div>
        </div>
        {form.typeClient === "entreprise" && (
          <div><label className="block text-xs text-white/40 mb-1.5">Nom de l&apos;entreprise</label><input value={form.entrepriseClienteNom} onChange={(e) => set("entrepriseClienteNom", e.target.value)} className="input-dark" placeholder="Maze Bank" /></div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "✓ Créer et ajouter"}
          </button>
          <button onClick={onClose} className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">Annuler</button>
        </div>
      </div>
    </div>
  );
}