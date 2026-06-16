"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormExtras from "./FormExtras";
import NouveauClientModal from "../clients/NouveauClientModal";
import FormClients from "../clients/FormClients";
import { Client, Produit } from "@prisma/client";

// Modification du type Ligne pour stocker le prix d'achat et le flag employé
type Ligne = { 
  produitId: number; 
  nom: string; 
  quantite: number; 
  prixVente: number;
  prixAchat: number;
  prixEtudiant: boolean; 
  prixEmploye: boolean; // <-- Ajout de l'option employé
};
type Extra = { label: string; montant: number };

export default function NouvelleVenteForm({ clients: initialClients, produits }: { clients: Client[]; produits: Produit[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<number | null>(null);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);

  // Calcul dynamique du total des produits à l'affichage selon le mode tarifaire coché
  const totalProduits = lignes.reduce((acc, l) => {
    let prixEffectif = l.prixVente;
    if (l.prixEmploye) {
      prixEffectif = l.prixAchat;
    } else if (l.prixEtudiant) {
      prixEffectif = Math.round((l.prixVente * 0.84) * 100) / 100;
    }
    return acc + l.quantite * prixEffectif;
  }, 0);

  const totalExtras = extras.reduce((acc, e) => acc + e.montant, 0);
  const total = totalProduits + totalExtras;

  const clientSelectionFormat = selectedClient 
    ? [{ clientId: selectedClient.id, nbPersonnes: 1, commentaire: "" }] 
    : [];

  function ajouterProduit(p: Produit) {
    const prixVenteNum = Number(p.prixVente);
    const prixAchatNum = Number(p.prixAchat);
    
    setLignes((prev) => {
      const exist = prev.find((l) => l.produitId === p.id);
      if (exist) return prev.map((l) => l.produitId === p.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...prev, { 
        produitId: p.id, 
        nom: p.nom, 
        quantite: 1, 
        prixVente: prixVenteNum, 
        prixAchat: prixAchatNum, 
        prixEtudiant: false, 
        prixEmploye: false 
      }];
    });
  }
  
  function setQuantite(id: number, q: number) {
    if (q <= 0) return setLignes((p) => p.filter((l) => l.produitId !== id));
    setLignes((p) => p.map((l) => l.produitId === id ? { ...l, quantite: q } : l));
  }

  // Active le tarif étudiant et désactive le tarif employé
  function togglePrixEtudiant(id: number) {
    setLignes((p) => p.map((l) => l.produitId === id ? { 
      ...l, 
      prixEtudiant: !l.prixEtudiant,
      prixEmploye: !l.prixEtudiant ? false : l.prixEmploye 
    } : l));
  }

  // Active le tarif employé (prix d'achat) et désactive le tarif étudiant
  function togglePrixEmploye(id: number) {
    setLignes((p) => p.map((l) => l.produitId === id ? { 
      ...l, 
      prixEmploye: !l.prixEmploye,
      prixEtudiant: !l.prixEmploye ? false : l.prixEtudiant 
    } : l));
  }

  async function handleSubmit() {
    if (!clientId) return setError("Sélectionnez un client");
    if (!lignes.length && !extras.length) return setError("Ajoutez au moins un produit ou un extra");
    setLoading(true); setError("");

    const res = await fetch("/api/ventes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // On transmet les drapeaux prixEtudiant et prixEmploye au serveur
      body: JSON.stringify({ clientId, lignes, extras }),
    });
    
    if (res.ok) { 
      router.push("/dashboard/ventes"); 
      router.refresh(); 
    } else { 
      const d = await res.json(); 
      setError(d.error ?? "Erreur"); 
      setLoading(false); 
    }
  }

  return (
    <>
      {showModal && (
        <NouveauClientModal
          onClose={() => setShowModal(false)} 
          onCreated={(c) => { setClients((p) => [...p, c]); setClientId(c.id); setShowModal(false); }} 
        />
      )}

      <div className="space-y-6">
        {/* CLIENT */}
        <FormClients
          clients={clients} 
          selectedClients={clientSelectionFormat} 
          onSelectClient={(id) => setClientId(id)} 
          onRemoveClient={() => setClientId(null)} 
          onUpdateNbPersonnes={() => {}} 
          onOpenModal={() => setShowModal(true)} 
        />

        {/* PRODUITS */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Produits</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {produits.map((p) => {
              const inCart = lignes.find((l) => l.produitId === p.id);
              return (
                <button key={p.id} type="button" onClick={() => ajouterProduit(p)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${inCart ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/60 hover:text-white hover:border-white/20"}`}>
                  <span className="block truncate">{p.nom}</span>
                  <span className="text-xs opacity-60">${Number(p.prixVente).toFixed(0)} · stock {p.stock}</span>
                </button>
              );
            })}
          </div>

          {lignes.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-3">
              {lignes.map((l) => {
                let prixEffectifLigne = l.prixVente;
                if (l.prixEmploye) {
                  prixEffectifLigne = l.prixAchat;
                } else if (l.prixEtudiant) {
                  prixEffectifLigne = Math.round((l.prixVente * 0.84) * 100) / 100;
                }
                
                return (
                  <div key={l.produitId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f0f1a]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-sm text-white flex-1 truncate font-medium">{l.nom}</span>
                    
                    {/* Toggles de réduction */}
                    <div className="flex items-center gap-4 my-1 sm:my-0">
                      {/* Switch Étudiant */}
                      <label className="relative flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={l.prixEtudiant}
                          onChange={() => togglePrixEtudiant(l.produitId)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer border border-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/30 peer-checked:after:bg-[#c4bbff] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#2a2250] peer-checked:border-[#3d3580]"></div>
                        <span className="ml-1.5 text-[11px] font-medium text-white/40 peer-checked:text-[#c4bbff]">🎓 Étudiant</span>
                      </label>

                      {/* Switch Employé */}
                      <label className="relative flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={l.prixEmploye}
                          onChange={() => togglePrixEmploye(l.produitId)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer border border-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/30 peer-checked:after:bg-[#bbf7d0] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#14281d] peer-checked:border-emerald-800"></div>
                        <span className="ml-1.5 text-[11px] font-medium text-white/40 peer-checked:text-emerald-400">💼 Employé</span>
                      </label>
                    </div>

                    {/* Controles Quantités, prix de la ligne et suppression */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-white/5 pt-2 sm:pt-0 sm:border-none">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setQuantite(l.produitId, l.quantite - 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">−</button>
                        <span className="text-white text-sm w-5 text-center">{l.quantite}</span>
                        <button type="button" onClick={() => setQuantite(l.produitId, l.quantite + 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">+</button>
                      </div>

                      <span className="text-sm text-white/60 w-16 text-right">${(l.quantite * prixEffectifLigne).toFixed(0)}</span>
                      <button type="button" onClick={() => setQuantite(l.produitId, 0)} className="text-white/20 hover:text-red-400 text-xs transition-colors pl-2">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EXTRAS */}
        <FormExtras 
          extras={extras} 
          onAddExtra={(label, montant) => setExtras((p) => [...p, { label, montant }])} 
          onRemoveExtra={(index) => setExtras((p) => p.filter((_, j) => j !== index))} 
        />

        {/* TOTAL & SUBMIT */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          {extras.length > 0 && (
            <div className="space-y-1.5 mb-4 pb-4 border-b border-white/10">
              <div className="flex justify-between text-sm text-white/50"><span>Produits</span><span>${totalProduits.toFixed(0)}</span></div>
              <div className="flex justify-between text-sm text-white/50"><span>Extras</span><span>${totalExtras.toFixed(0)}</span></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/40 text-sm">Total</span>
            <span className="text-2xl font-medium text-white">${total.toFixed(0)}</span>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Validation..." : "✓ Valider la vente"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}