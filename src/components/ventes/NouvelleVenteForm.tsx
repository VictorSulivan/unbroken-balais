"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = { id: number; nom: string; prenom: string | null };
type Produit = { id: number; nom: string; prixVente: number; stock: number; categorie: string };
type Ligne = { produitId: number; nom: string; quantite: number; prixUnitaire: number };

export default function NouvelleVenteForm({
  clients,
  produits,
}: {
  clients: Client[];
  produits: Produit[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState<number | null>(null);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);

  function ajouterProduit(p: Produit) {
    setLignes((prev) => {
      const exist = prev.find((l) => l.produitId === p.id);
      if (exist) {
        return prev.map((l) =>
          l.produitId === p.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnitaire: p.prixVente }];
    });
  }

  function retirerLigne(produitId: number) {
    setLignes((prev) => prev.filter((l) => l.produitId !== produitId));
  }

  function setQuantite(produitId: number, q: number) {
    if (q <= 0) return retirerLigne(produitId);
    setLignes((prev) =>
      prev.map((l) => (l.produitId === produitId ? { ...l, quantite: q } : l))
    );
  }

  async function handleSubmit() {
    if (!clientId) return setError("Sélectionnez un client");
    if (!lignes.length) return setError("Ajoutez au moins un produit");
    setLoading(true);
    setError("");
    const res = await fetch("/api/ventes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, lignes }),
    });
    if (res.ok) {
      router.push("/dashboard/ventes");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sélection client */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Client</p>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setClientId(c.id)}
              className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                clientId === c.id
                  ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                  : "bg-[#0f0f1a] border-white/10 text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              {c.prenom} {c.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection produits */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Produits</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {produits.map((p) => {
            const inCart = lignes.find((l) => l.produitId === p.id);
            return (
              <button
                key={p.id}
                onClick={() => ajouterProduit(p)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                  inCart
                    ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]"
                    : "bg-[#0f0f1a] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="block">{p.nom}</span>
                <span className="text-xs opacity-60">${p.prixVente} · stock {p.stock}</span>
              </button>
            );
          })}
        </div>

        {/* Lignes panier */}
        {lignes.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-2">
            {lignes.map((l) => (
              <div key={l.produitId} className="flex items-center justify-between gap-3">
                <span className="text-sm text-white flex-1 truncate">{l.nom}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantite(l.produitId, l.quantite - 1)}
                    className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
                  >−</button>
                  <span className="text-white text-sm w-5 text-center">{l.quantite}</span>
                  <button
                    onClick={() => setQuantite(l.produitId, l.quantite + 1)}
                    className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
                  >+</button>
                </div>
                <span className="text-sm text-white/60 w-16 text-right">
                  ${(l.quantite * l.prixUnitaire).toFixed(0)}
                </span>
                <button
                  onClick={() => retirerLigne(l.produitId)}
                  className="text-white/20 hover:text-red-400 text-xs transition-colors"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total + validation */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/40 text-sm">Total</span>
          <span className="text-2xl font-medium text-white">${total.toFixed(0)}</span>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Validation..." : "✓ Valider la vente"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
