"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouveauClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", typeClient: "particulier", entrepriseClienteNom: "",
  });

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.nom) return setError("Le nom est requis");
    setLoading(true);
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouveau client</h1>
        <p className="text-white/40 text-sm mt-1">Ajouter un client au registre</p>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl p-6 space-y-5">

        {/* Type */}
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Type de client</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "particulier", label: "👤  Particulier" },
              { value: "entreprise",  label: "🏢  Entreprise" },
            ].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set("typeClient", value)}
                className={`py-2.5 rounded-lg text-sm border transition-colors ${
                  form.typeClient === value
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Nom / Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prénom</label>
            <input value={form.prenom} onChange={(e) => set("prenom", e.target.value)}
              className="input-dark" placeholder="Michael" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Nom</label>
            <input value={form.nom} onChange={(e) => set("nom", e.target.value)}
              className="input-dark" placeholder="De Santa" />
          </div>
        </div>

        {/* Entreprise cliente */}
        {form.typeClient === "entreprise" && (
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Nom de l&apos;entreprise</label>
            <input value={form.entrepriseClienteNom}
              onChange={(e) => set("entrepriseClienteNom", e.target.value)}
              className="input-dark" placeholder="Maze Bank" />
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "Créer le client"}
          </button>
          <button onClick={() => router.back()}
            className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
