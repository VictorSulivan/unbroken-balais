"use client";

import type { EmployeStat } from "types/analyse";
import { fmt } from "src/utils/buildMoisStats";

export function ClassementEmployes({
  employes,
  sansEmploye,
}: {
  employes: EmployeStat[];
  sansEmploye: { gains: number; depenses: number; taxes: number };
}) {
  const maxGains = Math.max(...employes.map((e) => e.gains), 1);
  const hasSansEmploye =
    sansEmploye.gains > 0 || sansEmploye.depenses > 0 || sansEmploye.taxes > 0;

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            Contribution par employé
          </p>
          <p className="text-xs text-white/20 mt-0.5">
            Classé par solde net généré sur la période
          </p>
        </div>
        <span className="text-xs text-white/30 border border-white/10 rounded-lg px-2 py-1">
          {employes.length} employé{employes.length > 1 ? "s" : ""}
        </span>
      </div>

      {employes.length === 0 && !hasSansEmploye ? (
        <p className="text-white/20 text-sm py-8 text-center">
          Aucune transaction attribuée à un employé sur cette période.
        </p>
      ) : (
        <div className="space-y-4">
          {employes.map((e, i) => {
            const net = e.gains - e.depenses - e.taxes;
            const pct = Math.round((e.gains / maxGains) * 100);
            return (
              <EmployeRow
                key={e.id}
                rang={i + 1}
                nom={e.nom}
                gains={e.gains}
                depenses={e.depenses}
                taxes={e.taxes}
                net={net}
                pct={pct}
                nbTransactions={e.nbTransactions}
              />
            );
          })}

          {hasSansEmploye && (
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5" />
                  <span className="text-white/25 italic">Sans employé attribué</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-400/40">
                    +{fmt(sansEmploye.gains)} Mornilles
                  </span>
                  <span className="text-red-400/40">
                    -{fmt(sansEmploye.depenses + sansEmploye.taxes)} Mornilles
                  </span>
                  <span className="text-white/25 tabular-nums w-20 text-right">
                    {fmt(sansEmploye.gains - sansEmploye.depenses - sansEmploye.taxes)} Mornilles
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmployeRow({
  rang,
  nom,
  gains,
  depenses,
  taxes,
  net,
  pct,
  nbTransactions,
}: {
  rang: number;
  nom: string;
  gains: number;
  depenses: number;
  taxes: number;
  net: number;
  pct: number;
  nbTransactions: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-white/20 font-mono w-5 shrink-0 text-right">
            {rang}
          </span>
          <span className="text-sm text-white/80 font-medium truncate">{nom}</span>
          <span className="text-xs text-white/25 shrink-0">{nbTransactions} tx</span>
        </div>

        {/* Stats inline */}
        <div className="flex items-center gap-4 text-xs shrink-0 ml-4">
          <span className="text-green-400/70 tabular-nums hidden sm:block">
            +{fmt(gains)} Mornilles
          </span>
          <span className="text-red-400/70 tabular-nums hidden sm:block">
            -{fmt(depenses + taxes)} Mornilles
          </span>
          <span
            className={`font-semibold tabular-nums w-20 text-right ${
              net >= 0 ? "text-[#a89af9]" : "text-red-400"
            }`}
          >
            {net >= 0 ? "+" : ""} Mornilles {fmt(net)}
          </span>
        </div>
      </div>

      {/* Barre de progression gains */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden ml-8">
        <div
          className="h-full bg-gradient-to-r from-[#a89af9]/50 to-[#7c6ef0]/30 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}