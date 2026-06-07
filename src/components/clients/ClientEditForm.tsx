"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClientForm = {
  id: number;
  nom: string;
  prenom: string | null;
  typeClient: string | null;
};

export default function ClientEditForm({ client }: { client: ClientForm }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: client.nom,
    prenom: client.prenom ?? "",
    typeClient: client.typeClient ?? "particulier",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
      <p className="text-xs text-white/40 uppercase tracking-widest">Modifier</p>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "particulier", label: "👤  Particulier" },
            { value: "entreprise",  label: "🏢  Entreprise" },
          ].map(({ value, label }) => (
            <button key={value} type="button" onClick={() => set("typeClient", value)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                form.typeClient === value
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

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
