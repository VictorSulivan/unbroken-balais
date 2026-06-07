"use client";

import { useState } from "react";

export default function CalculateurTaxe() {
  const [montantSouhaite, setMontantSouhaite] = useState<string>("");
  const TAXE_POURCENT = 20;

  const souhait = parseFloat(montantSouhaite) || 0;
  
  // Calcul : Pour recevoir X après 20% de taxe, on fait X / 0.8
  const montantADemander = Math.ceil(souhait / (1 - TAXE_POURCENT / 100));
  const taxePrise = montantADemander - souhait;

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5 mb-8">
      <h2 className="text-white font-medium text-sm uppercase tracking-widest mb-4">
        Simulateur de Retrait Gringotts
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Input montant souhaité */}
        <div>
          <label className="block text-white/40 text-xs mb-2">Montant net désiré (Mornilles)</label>
          <input
            type="number"
            value={montantSouhaite}
            onChange={(e) => setMontantSouhaite(e.target.value)}
            placeholder="Ex: 1000"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/20 h-[42px]"
          />
        </div>

        {/* Résultat : Ce qu'il faut demander */}
        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-[42px] flex items-center justify-between">
          <span className="text-white/40 text-xs">À demander :</span>
          <span className="text-xl font-semibold text-green-400">
            ${montantADemander.toLocaleString("fr-FR")}
          </span>
        </div>

        {/* Résultat : Montant de la taxe */}
        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-[42px] flex items-center justify-between">
          <span className="text-white/40 text-xs">Taxe ({TAXE_POURCENT}%) :</span>
          <span className="text-sm font-medium text-red-400">
            -${taxePrise.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>
      
      <p className="text-white/20 text-[11px] mt-2 italic">
        * Arrondi supérieur automatique inclus pour garantir la réception exacte du montant désiré.
      </p>
    </div>
  );
}