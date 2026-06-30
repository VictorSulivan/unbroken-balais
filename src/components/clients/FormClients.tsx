"use client";

import { Client } from "@prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";

// --- COMPOSANT : DROPDOWN SELECTION CLIENTS ---
export default function FormClients({
  clients,
  selectedClients,
  onSelectClient,
  onRemoveClient,
  onOpenModal,
}: {
  clients: Client[];
  selectedClients: { clientId: number; nbPersonnes?: number; commentaire?: string }[];
  onSelectClient: (id: number) => void;
  onRemoveClient: (id: number) => void;
  onOpenModal: () => void;
  onUpdateNbPersonnes?: (id: number, count: number) => void; // <-- Optionnel (?) pour ne pas casser NouvelleVenteForm
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Récupération du client unique sélectionné
  const selectedClient = selectedClients.length > 0 
    ? clients.find((c) => c.id === selectedClients[0].clientId) 
    : null;

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

  return (
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
          <button 
            type="button"
            onClick={() => { onRemoveClient(selectedClient.id); setSearch(""); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Changer
          </button>
        </div>
      ) : (
        <div ref={dropdownRef} className="relative">
          <div className={`flex items-center gap-3 bg-[#0f0f1a] border rounded-xl px-4 py-3 transition-all duration-150 ${open ? "border-[#a89af9]/60 ring-2 ring-[#a89af9]/10" : "border-white/10 hover:border-white/20"}`}>
            <svg className={`w-4 h-4 shrink-0 transition-colors ${open ? "text-[#a89af9]" : "text-white/25"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input 
              ref={inputRef} 
              autoFocus 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Rechercher un client..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none min-w-0" 
            />
            {search && (
              <button 
                type="button"
                onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/40 hover:text-white transition-colors text-[10px] shrink-0"
              >
                ✕
              </button>
            )}
          </div>
          {open && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
              {filteredClients.length > 0 ? (
                <div className="py-1.5 max-h-52 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <button 
                      key={c.id} 
                      type="button"
                      onMouseDown={() => { onSelectClient(c.id); setSearch(""); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#2a2250] border border-[#3d3580]/50 flex items-center justify-center text-[#a89af9] text-xs font-medium uppercase shrink-0">
                        {c.prenom?.[0] ?? c.nom[0]}{c.nom[0]}
                      </div>
                      <span className="text-white/70 group-hover:text-white text-sm transition-colors">{c.prenom} {c.nom}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-white/30 text-sm">Aucun résultat pour <span className="text-white/50">&quot;{search}&quot;</span></p>
                </div>
              )}
              <div className="border-t border-white/5 p-2">
                <button 
                  type="button"
                  onMouseDown={() => { setOpen(false); onOpenModal(); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-[#a89af9] hover:bg-[#2a2250]/40 py-2 rounded-lg transition-colors"
                >
                  <span className="text-base leading-none">+</span> Nouveau client
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}