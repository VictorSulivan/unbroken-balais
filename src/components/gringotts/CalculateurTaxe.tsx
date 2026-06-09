"use client";

import { useState } from "react";

const TAXE = 30;

type Mode = "simulateur" | "versement" | "retrait";

export default function CalculateurTaxe() {
  const [mode, setMode] = useState<Mode>("simulateur");

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden mb-8">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {([
          { id: "simulateur", label: "🧮 Simulateur" },
          { id: "versement",  label: "💸 Versement" },
          { id: "retrait",    label: "🏧 Retrait" },
        ] as { id: Mode; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === id
                ? "text-white border-b-2 border-[#a89af9] bg-white/3"
                : "text-white/40 hover:text-white/70"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {mode === "simulateur" && <Simulateur />}
        {mode === "versement"  && <Transaction type="versement" />}
        {mode === "retrait"    && <Transaction type="retrait" />}
      </div>
    </div>
  );
}

function Simulateur() {
  const [montant, setMontant] = useState("");
  const souhait = parseFloat(montant) || 0;
  const aDemanderr = souhait > 0 ? Math.ceil(souhait / (1 - TAXE / 100)) : 0;
  const taxe = aDemanderr - souhait;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Simulateur de retrait Gringotts</p>
        <p className="text-white/30 text-xs mb-4">Calcule combien demander pour recevoir exactement le montant désiré après {TAXE}% de taxe.</p>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Montant net désiré ($)</label>
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Ex: 1000"
          className="input-dark"
        />
      </div>

      {souhait > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">À demander</p>
            <p className="text-2xl font-medium text-green-400">${aDemanderr.toLocaleString("fr-FR")}</p>
          </div>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">Taxe Gringotts ({TAXE}%)</p>
            <p className="text-2xl font-medium text-red-400">-${taxe.toLocaleString("fr-FR")}</p>
          </div>
        </div>
      )}

      <p className="text-white/20 text-[11px] italic">
        * Arrondi supérieur automatique inclus pour garantir la réception exacte du montant désiré.
      </p>
    </div>
  );
}

function Transaction({ type }: { type: "versement" | "retrait" }) {
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isRetrait = type === "retrait";
  const montantNum = parseFloat(montant) || 0;
  const taxe = isRetrait ? Math.round(montantNum * TAXE / 100) : 0;
  const netRecu = montantNum - taxe;

  async function handleSubmit() {
    if (!montantNum) return setError("Montant requis");
    setLoading(true); setError("");

    const res = await fetch("/api/gringotts/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        montant: montantNum,
        description: description || (isRetrait ? `Retrait manuel` : `Versement manuel`),
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setMontant(""); setDescription("");
      setTimeout(() => { setSuccess(false); window.location.reload(); }, 1500);
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
          {isRetrait ? "Retrait depuis Gringotts" : "Versement vers Gringotts"}
        </p>
        <p className="text-white/30 text-xs mb-4">
          {isRetrait
            ? `Gringotts prélève ${TAXE}% de taxe sur chaque retrait.`
            : "Ajouter de l'argent au solde Gringotts directement."}
        </p>
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">
          {isRetrait ? "Montant brut à retirer ($)" : "Montant à verser ($)"}
        </label>
        <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)}
          placeholder="Ex: 5000" className="input-dark" />
      </div>

      {isRetrait && montantNum > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-3">
            <p className="text-xs text-white/40 mb-1">Taxe ({TAXE}%)</p>
            <p className="text-lg font-medium text-red-400">-${taxe.toLocaleString("fr-FR")}</p>
          </div>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-3">
            <p className="text-xs text-white/40 mb-1">Net reçu</p>
            <p className="text-lg font-medium text-green-400">${netRecu.toLocaleString("fr-FR")}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Description (optionnel)</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder={isRetrait ? "Achat véhicule, loyer..." : "Remboursement, apport..."}
          className="input-dark" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
          success
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : isRetrait
              ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 disabled:opacity-50"
              : "bg-[#2a2250] hover:bg-[#342b6e] border-[#3d3580] text-[#c4bbff] disabled:opacity-50"
        }`}>
        {success ? "✓ Opération effectuée" : loading ? "En cours..." : isRetrait ? "Effectuer le retrait" : "Effectuer le versement"}
      </button>
    </div>
  );
}
