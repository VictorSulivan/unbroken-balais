"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES_EMPLOYE = ["stagiaire", "employe", "co_patron", "patron"];

type EmployeForm = {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  salaire: number | null;
  notes: string | null;
};

export default function EmployeEditForm({ employe }: { employe: EmployeForm }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: employe.nom,
    prenom: employe.prenom,
    role: employe.role,
    salaire: employe.salaire?.toString() ?? "",
    notes: employe.notes ?? "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/employes/${employe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        salaire: form.salaire ? parseFloat(form.salaire) : null,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Modifier</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Prénom</label>
          <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Rôle</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES_EMPLOYE.map((r) => (
            <button key={r} type="button" onClick={() => set("role", r)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                form.role === r
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}>
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Salaire (Mornilles)</label>
        <input type="number" value={form.salaire}
          onChange={(e) => set("salaire", e.target.value)}
          className="input-dark" placeholder="5000" />
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Notes</label>
        <textarea rows={2} value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="input-dark resize-none" />
      </div>

      <button onClick={handleSave} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          saved
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#2a2250] hover:bg-[#342b6e] border-[#3d3580] text-[#c4bbff] disabled:opacity-50"
        }`}>
        {saved ? "✓ Sauvegardé" : loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}
