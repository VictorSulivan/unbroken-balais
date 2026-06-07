"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["CDI", "Stage", "Co-Patron", "Patron"];

export default function NouveauContratForm({ employeId }: { employeId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    typeContrat: "CDI",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: "",
    salaire: "",
    pourcentagePrime: "",
    commentaire: "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/contrats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, employeId }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setForm((f) => ({ ...f, dateFin: "", commentaire: "" }));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Nouveau contrat</p>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Type de contrat</label>
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => set("typeContrat", t)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                form.typeContrat === t
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de début</label>
          <input type="date" value={form.dateDebut}
            onChange={(e) => set("dateDebut", e.target.value)}
            className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Date de fin (optionnel)</label>
          <input type="date" value={form.dateFin}
            onChange={(e) => set("dateFin", e.target.value)}
            className="input-dark" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Salaire mensuel (Mornilles)</label>
          <input type="number" value={form.salaire}
            onChange={(e) => set("salaire", e.target.value)}
            className="input-dark" placeholder="5000" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Prime (%)</label>
          <input type="number" value={form.pourcentagePrime}
            onChange={(e) => set("pourcentagePrime", e.target.value)}
            className="input-dark" placeholder="10" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Commentaire (optionnel)</label>
        <input value={form.commentaire}
          onChange={(e) => set("commentaire", e.target.value)}
          className="input-dark" placeholder="Promotion, renouvellement..." />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          success
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#2a2250] hover:bg-[#342b6e] border-[#3d3580] text-[#c4bbff] disabled:opacity-50"
        }`}>
        {success ? "✓ Contrat créé" : loading ? "Création..." : "Créer le contrat"}
      </button>
    </div>
  );
}
