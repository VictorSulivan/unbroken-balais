"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Employe = { id: number; nom: string; prenom: string };
type Client = { id: number; nom: string; prenom: string | null };
type Produit = { id: number; nom: string; prixVente: number; categorie: string };

export default function NouvelEvenementForm({
  employes, clients, produits,
}: {
  employes: Employe[];
  clients: Client[];
  produits: Produit[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titre: "", type: "reservation",
    dateDebut: "", dateFin: "",
    description: "", responsableId: "",
  });
  const [selectedEmployes, setSelectedEmployes] = useState<number[]>([]);
  const [selectedClients, setSelectedClients] = useState<{ clientId: number; nbPersonnes: number; commentaire: string }[]>([]);
  const [conso, setConso] = useState<{ produitId: number; nom: string; quantite: number; prixUnitaire: number }[]>([]);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleEmploye(id: number) {
    setSelectedEmployes((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function toggleClient(id: number) {
    setSelectedClients((prev) => {
      if (prev.find((c) => c.clientId === id)) return prev.filter((c) => c.clientId !== id);
      return [...prev, { clientId: id, nbPersonnes: 1, commentaire: "" }];
    });
  }

  function toggleProduit(p: Produit) {
    setConso((prev) => {
      if (prev.find((c) => c.produitId === p.id)) return prev.filter((c) => c.produitId !== p.id);
      return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnitaire: p.prixVente }];
    });
  }

  function setConsoQte(produitId: number, q: number) {
    setConso((prev) => prev.map((c) => c.produitId === produitId ? { ...c, quantite: q } : c));
  }

  async function handleSubmit() {
    if (!form.titre || !form.dateDebut) return setError("Titre et date requis");
    setLoading(true);
    setError("");
    const res = await fetch("/api/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        responsableId: form.responsableId || null,
        employeIds: selectedEmployes,
        clientIds: selectedClients,
        consommations: conso,
      }),
    });
    if (res.ok) {
      router.push("/dashboard/calendrier");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Infos principales */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-widest">Informations</p>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: "reservation", l: "📋  Réservation" }, { v: "soiree", l: "🎉  Soirée" }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => set("type", v)}
                className={`py-2.5 rounded-lg text-sm border transition-colors ${
                  form.type === v
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white"
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Titre</label>
          <input value={form.titre} onChange={(e) => set("titre", e.target.value)}
            className="input-dark" placeholder="Soirée d'anniversaire..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Date de début</label>
            <input type="datetime-local" value={form.dateDebut}
              onChange={(e) => set("dateDebut", e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Date de fin</label>
            <input type="datetime-local" value={form.dateFin}
              onChange={(e) => set("dateFin", e.target.value)} className="input-dark" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Description</label>
          <textarea rows={2} value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="input-dark resize-none" placeholder="Détails de l'événement..." />
        </div>
      </div>

      {/* Responsable + équipe */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-widest">Équipe</p>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Responsable</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
            {employes.map((e) => (
              <button key={e.id} type="button"
                onClick={() => set("responsableId", form.responsableId === e.id.toString() ? "" : e.id.toString())}
                className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                  form.responsableId === e.id.toString()
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"
                }`}>
                {e.prenom} {e.nom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Employés présents</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
            {employes.map((e) => (
              <button key={e.id} type="button" onClick={() => toggleEmploye(e.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                  selectedEmployes.includes(e.id)
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"
                }`}>
                {e.prenom} {e.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-widest">Clients</p>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {clients.map((c) => (
            <button key={c.id} type="button" onClick={() => toggleClient(c.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                selectedClients.find((sc) => sc.clientId === c.id)
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"
              }`}>
              {c.prenom} {c.nom}
            </button>
          ))}
        </div>

        {selectedClients.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            {selectedClients.map((sc) => {
              const client = clients.find((c) => c.id === sc.clientId);
              return (
                <div key={sc.clientId} className="flex items-center gap-3">
                  <span className="text-white/60 text-sm flex-1">{client?.prenom} {client?.nom}</span>
                  <input type="number" min={1} value={sc.nbPersonnes}
                    onChange={(e) => setSelectedClients((prev) =>
                      prev.map((c) => c.clientId === sc.clientId ? { ...c, nbPersonnes: parseInt(e.target.value) || 1 } : c)
                    )}
                    className="input-dark w-20 text-center" placeholder="nb" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consommations */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-widest">Consommations prévues</p>
        <div className="grid grid-cols-2 gap-2">
          {produits.map((p) => (
            <button key={p.id} type="button" onClick={() => toggleProduit(p)}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                conso.find((c) => c.produitId === p.id)
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/50 hover:text-white"
              }`}>
              <span className="block">{p.nom}</span>
              <span className="text-xs opacity-60">${p.prixVente}</span>
            </button>
          ))}
        </div>

        {conso.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            {conso.map((c) => (
              <div key={c.produitId} className="flex items-center gap-3">
                <span className="text-white/60 text-sm flex-1">{c.nom}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConsoQte(c.produitId, Math.max(1, c.quantite - 1))}
                    className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm">−</button>
                  <span className="text-white text-sm w-5 text-center">{c.quantite}</span>
                  <button onClick={() => setConsoQte(c.produitId, c.quantite + 1)}
                    className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm">+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
          {loading ? "Création..." : "Créer l'événement"}
        </button>
        <button onClick={() => router.back()}
          className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
          Annuler
        </button>
      </div>
    </div>
  );
}
