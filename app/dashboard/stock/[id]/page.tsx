"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProduit() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  interface ProduitForm {
    nom: string;
    stock: number;
    prixAchat: number;
    prixVente: number;
    description: string | null;
  }
  const [form, setForm] = useState<ProduitForm | null>(null);

  useEffect(() => {
    fetch(`/api/produits/${id}`).then((r) => r.json()).then(setForm);
  }, [id]);

  function set(key: keyof ProduitForm, val: string | number | boolean) {
    setForm((f) => f ? ({ ...f, [key]: val }) : f);
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/produits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/dashboard/stock");
    router.refresh();
  }

  if (!form) return <div className="text-white/40">Chargement...</div>;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Modifier le produit</h1>
        <p className="text-white/40 text-sm mt-1">{form.nom}</p>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Nom</label>
          <input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value) || 0)} className="input-dark" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prix achat (mornilles)</label>
            <input type="number" value={form.prixAchat} onChange={(e) => set("prixAchat", parseFloat(e.target.value) || 0)} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Prix vente (mornilles)</label>
            <input type="number" value={form.prixVente} onChange={(e) => set("prixVente", parseFloat(e.target.value) || 0)} className="input-dark" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Description</label>
          <textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="input-dark resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Sauvegarde..." : "Sauvegarder"}
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
