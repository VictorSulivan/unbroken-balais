"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["manuel", "performance", "anciennete", "exceptionnel"];

export default function NouvelleprimeForm({ employes }: { employes: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    employeId: "",
    montant: "",
    typePrime: "manuel",
    commentaire: "",
    semestre: now.getMonth() < 6 ? "1" : "2",
    annee: now.getFullYear().toString(),
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.employeId || !form.montant) return setError("Sélectionnez un employé et un montant");
    setLoading(true);
    setError("");
    const res = await fetch("/api/primes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setForm((f) => ({ ...f, employeId: "", montant: "", commentaire: "" }));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4 h-fit">
      <p className="text-xs text-white/40 uppercase tracking-widest">Nouvelle prime</p>

      {/* Employé */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Employé</label>
        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
          {employes.map((e) => (
            <button key={e.id} type="button" onClick={() => set("employeId", e.id.toString())}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                form.employeId === e.id.toString()
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}>
              {e.prenom} {e.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Type de prime</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => set("typePrime", t)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                form.typePrime === t
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Montant */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Montant (mornilles)</label>
        <input type="number" min={0} value={form.montant}
          onChange={(e) => set("montant", e.target.value)}
          className="input-dark" placeholder="1000" />
      </div>

      {/* Semestre / Année */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Semestre</label>
          <div className="grid grid-cols-2 gap-2">
            {["1", "2"].map((s) => (
              <button key={s} type="button" onClick={() => set("semestre", s)}
                className={`py-2 rounded-lg text-sm border transition-colors ${
                  form.semestre === s
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white"
                }`}>
                S{s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Année</label>
          <input type="number" value={form.annee}
            onChange={(e) => set("annee", e.target.value)}
            className="input-dark" />
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-xs text-white/40 mb-1.5">Commentaire (optionnel)</label>
        <input value={form.commentaire}
          onChange={(e) => set("commentaire", e.target.value)}
          className="input-dark" placeholder="Excellent mois de juin..." />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          success
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#2a2250] hover:bg-[#342b6e] border-[#3d3580] text-[#c4bbff] disabled:opacity-50"
        }`}>
        {success ? "✓ Prime attribuée" : loading ? "Attribution..." : "Attribuer la prime"}
      </button>
    </div>
  );
}
