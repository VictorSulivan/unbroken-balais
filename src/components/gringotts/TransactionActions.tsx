"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["vente", "versement", "retrait", "salaire", "prime", "taxe", "achat"];

type Transaction = {
  id: number;
  typeTransaction: string | null;
  montant: number | null;
  description: string | null;
};

export default function TransactionActions({ t }: { t: Transaction }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    typeTransaction: t.typeTransaction ?? "versement",
    montant: t.montant?.toString() ?? "",
    description: t.description ?? "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/gringotts/transaction/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { setMode("idle"); router.refresh(); }
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/gringotts/transaction/${t.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) { setMode("idle"); router.refresh(); }
  }

  if (mode === "delete") {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-red-400">Supprimer ?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Oui"}
        </button>
        <button
          onClick={() => setMode("idle")}
          className="text-xs px-2 py-1 bg-white/5 border border-white/10 text-white/40 rounded-lg hover:text-white transition-colors"
        >
          Non
        </button>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="flex flex-col gap-2 py-2">
        <div className="flex gap-2">
          <select
            value={form.typeTransaction}
            onChange={(e) => set("typeTransaction", e.target.value)}
            className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#a89af9]"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="number"
            value={form.montant}
            onChange={(e) => set("montant", e.target.value)}
            className="w-28 bg-[#0f0f1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#a89af9]"
            placeholder="Montant"
          />
        </div>
        <input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="bg-[#0f0f1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#a89af9]"
          placeholder="Description"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-xs px-3 py-1 bg-[#2a2250] border border-[#3d3580] text-[#c4bbff] rounded-lg hover:bg-[#342b6e] transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Sauvegarder"}
          </button>
          <button
            onClick={() => setMode("idle")}
            className="text-xs px-3 py-1 bg-white/5 border border-white/10 text-white/40 rounded-lg hover:text-white transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setMode("edit")}
        title="Modifier"
        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button
        onClick={() => setMode("delete")}
        title="Supprimer"
        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  );
}
