"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Client = { id: number; nom: string; prenom: string | null };
type Produit = { id: number; nom: string; prixVente: number; stock: number; categorie: string };
type Ligne = { produitId: number; nom: string; quantite: number; prixUnitaire: number };
type Extra = { label: string; montant: number };

function NouveauClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Client) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nom: "", prenom: "", typeClient: "particulier", entrepriseClienteNom: "" });

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSubmit() {
    if (!form.nom) return setError("Le nom est requis");
    setLoading(true); setError("");
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { onCreated(await res.json()); }
    else { const d = await res.json(); setError(d.error ?? "Erreur"); setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#16162a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium text-lg">Nouveau client</h2>
            <p className="text-white/40 text-xs mt-0.5">Ajouter au registre et sélectionner</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">✕</button>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Type de client</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: "particulier", label: "👤  Particulier" }, { value: "entreprise", label: "🏢  Entreprise" }].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set("typeClient", value)}
                className={`py-2.5 rounded-lg text-sm border transition-colors ${form.typeClient === value ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-white/40 mb-1.5">Prénom</label><input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} className="input-dark" placeholder="Michael" autoFocus /></div>
          <div><label className="block text-xs text-white/40 mb-1.5">Nom</label><input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="input-dark" placeholder="De Santa" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /></div>
        </div>
        {form.typeClient === "entreprise" && (
          <div><label className="block text-xs text-white/40 mb-1.5">Nom de l'entreprise</label><input value={form.entrepriseClienteNom} onChange={(e) => set("entrepriseClienteNom", e.target.value)} className="input-dark" placeholder="Maze Bank" /></div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Création..." : "✓ Créer et sélectionner"}
          </button>
          <button onClick={onClose} className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function NouvelleVenteForm({ clients: initialClients, produits }: { clients: Client[]; produits: Produit[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraMontant, setExtraMontant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find((c) => c.id === clientId);
  const totalProduits = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);
  const totalExtras = extras.reduce((acc, e) => acc + e.montant, 0);
  const total = totalProduits + totalExtras;

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients.slice(0, 8);
    const q = search.toLowerCase();
    return clients.filter((c) =>
      c.nom.toLowerCase().startsWith(q) ||
      c.prenom?.toLowerCase().startsWith(q) ||
      `${c.prenom} ${c.nom}`.toLowerCase().startsWith(q)
    ).slice(0, 8);
  }, [search, clients]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectClient(c: Client) { setClientId(c.id); setSearch(""); setOpen(false); }
  function handleClientCreated(c: Client) { setClients((p) => [...p, c]); selectClient(c); setShowModal(false); }

  function ajouterProduit(p: Produit) {
    setLignes((prev) => {
      const exist = prev.find((l) => l.produitId === p.id);
      if (exist) return prev.map((l) => l.produitId === p.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnitaire: p.prixVente }];
    });
  }
  function retirerLigne(id: number) { setLignes((p) => p.filter((l) => l.produitId !== id)); }
  function setQuantite(id: number, q: number) {
    if (q <= 0) return retirerLigne(id);
    setLignes((p) => p.map((l) => l.produitId === id ? { ...l, quantite: q } : l));
  }

  function ajouterExtra() {
    const montant = parseFloat(extraMontant);
    if (!extraLabel.trim() || !montant || montant <= 0) return;
    setExtras((p) => [...p, { label: extraLabel.trim(), montant }]);
    setExtraLabel(""); setExtraMontant("");
  }

  async function handleSubmit() {
    if (!clientId) return setError("Sélectionnez un client");
    if (!lignes.length && !extras.length) return setError("Ajoutez au moins un produit ou un extra");
    setLoading(true); setError("");

    // On ajoute les extras comme lignes virtuelles dans la vente (montantTotal inclut tout)
    const res = await fetch("/api/ventes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, lignes, extras, montantTotal: total }),
    });
    if (res.ok) { router.push("/dashboard/ventes"); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Erreur"); setLoading(false); }
  }

  return (
    <>
      {showModal && <NouveauClientModal onClose={() => setShowModal(false)} onCreated={handleClientCreated} />}

      <div className="space-y-6">
        {/* CLIENT */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Client</p>
          {selectedClient ? (
            <div className="flex items-center justify-between bg-[#2a2250] border border-[#3d3580] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#3d3580] flex items-center justify-center text-[#a89af9] text-xs font-semibold uppercase">
                  {selectedClient.prenom?.[0] ?? selectedClient.nom[0]}{selectedClient.nom[0]}
                </div>
                <div>
                  <p className="text-[#c4bbff] font-medium text-sm">{selectedClient.prenom} {selectedClient.nom}</p>
                  <p className="text-white/30 text-xs">Client sélectionné</p>
                </div>
              </div>
              <button onClick={() => { setClientId(null); setSearch(""); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                Changer
              </button>
            </div>
          ) : (
            <div ref={dropdownRef} className="relative">
              <div className={`flex items-center gap-3 bg-[#0f0f1a] border rounded-xl px-4 py-3 transition-all duration-150 ${open ? "border-[#a89af9]/60 ring-2 ring-[#a89af9]/10" : "border-white/10 hover:border-white/20"}`}>
                <svg className={`w-4 h-4 shrink-0 transition-colors ${open ? "text-[#a89af9]" : "text-white/25"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input ref={inputRef} autoFocus value={search}
                  onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  placeholder="Rechercher un client..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none min-w-0" />
                {search && (
                  <button onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/40 hover:text-white transition-colors text-[10px] shrink-0">✕</button>
                )}
              </div>
              {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                  {filteredClients.length > 0 ? (
                    <div className="py-1.5 max-h-52 overflow-y-auto">
                      {filteredClients.map((c) => (
                        <button key={c.id} onMouseDown={() => selectClient(c)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group">
                          <div className="w-7 h-7 rounded-full bg-[#2a2250] border border-[#3d3580]/50 flex items-center justify-center text-[#a89af9] text-xs font-medium uppercase shrink-0">
                            {c.prenom?.[0] ?? c.nom[0]}{c.nom[0]}
                          </div>
                          <span className="text-white/70 group-hover:text-white text-sm transition-colors">{c.prenom} {c.nom}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center">
                      <p className="text-white/30 text-sm">Aucun résultat pour <span className="text-white/50">"{search}"</span></p>
                    </div>
                  )}
                  <div className="border-t border-white/5 p-2">
                    <button onMouseDown={() => { setOpen(false); setShowModal(true); }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-[#a89af9] hover:bg-[#2a2250]/40 py-2 rounded-lg transition-colors">
                      <span className="text-base leading-none">+</span> Nouveau client
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRODUITS */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Produits</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {produits.map((p) => {
              const inCart = lignes.find((l) => l.produitId === p.id);
              return (
                <button key={p.id} onClick={() => ajouterProduit(p)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${inCart ? "bg-[#2a2250] border-[#3d3580] text-[#c4bbff]" : "bg-[#0f0f1a] border-white/10 text-white/60 hover:text-white hover:border-white/20"}`}>
                  <span className="block">{p.nom}</span>
                  <span className="text-xs opacity-60">${p.prixVente} · stock {p.stock}</span>
                </button>
              );
            })}
          </div>
          {lignes.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-2">
              {lignes.map((l) => (
                <div key={l.produitId} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-white flex-1 truncate">{l.nom}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantite(l.produitId, l.quantite - 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">−</button>
                    <span className="text-white text-sm w-5 text-center">{l.quantite}</span>
                    <button onClick={() => setQuantite(l.produitId, l.quantite + 1)} className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">+</button>
                  </div>
                  <span className="text-sm text-white/60 w-16 text-right">${(l.quantite * l.prixUnitaire).toFixed(0)}</span>
                  <button onClick={() => retirerLigne(l.produitId)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXTRAS */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Extras</p>

          {/* Ligne d'ajout */}
          <div className="flex gap-2 mb-3">
            <input
              value={extraLabel}
              onChange={(e) => setExtraLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ajouterExtra()}
              placeholder="Description (ex: location salle)"
              className="input-dark flex-1"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input
                type="number"
                min={0}
                value={extraMontant}
                onChange={(e) => setExtraMontant(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ajouterExtra()}
                placeholder="0"
                className="input-dark w-24 pl-7 text-right"
              />
            </div>
            <button
              onClick={ajouterExtra}
              disabled={!extraLabel.trim() || !extraMontant}
              className="px-4 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm rounded-lg transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Liste des extras */}
          {extras.length > 0 ? (
            <div className="space-y-2">
              {extras.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-[#0f0f1a] rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a89af9] bg-[#2a2250] border border-[#3d3580] px-1.5 py-0.5 rounded">Extra</span>
                    <span className="text-sm text-white/70">{e.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">${e.montant.toFixed(0)}</span>
                    <button onClick={() => setExtras((p) => p.filter((_, j) => j !== i))}
                      className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/20 text-xs text-center py-3">Aucun extra — location, service, pourboire...</p>
          )}
        </div>

        {/* TOTAL */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          {/* Détail si extras */}
          {extras.length > 0 && (
            <div className="space-y-1.5 mb-4 pb-4 border-b border-white/10">
              <div className="flex justify-between text-sm text-white/50">
                <span>Produits</span>
                <span>${totalProduits.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/50">
                <span>Extras</span>
                <span>${totalExtras.toFixed(0)}</span>
              </div>
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
            <button onClick={() => router.back()}
              className="px-4 text-sm text-white/40 hover:text-white border border-white/10 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
