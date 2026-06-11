"use client";

import type { KpiData, EmployeStat } from "types/analyse";
import { fmt, periodeLabel } from "src/utils/buildMoisStats";
import type { Periode } from "types/analyse";

export function ResumeTextuel({
  kpi,
  topEmploye,
  periode,
  debut,
  fin,
}: {
  kpi: KpiData;
  topEmploye: EmployeStat | null;
  periode: Periode;
  debut?: string;
  fin?: string;
}) {
  const label = periodeLabel(periode, debut, fin);

  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
      <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Résumé</p>
      <p className="text-white/50 text-sm leading-relaxed">
        Sur la période{" "}
        <span className="text-white/80">{label}</span>, Gringotts a enregistré{" "}
        <span className="text-green-400">${fmt(kpi.gains)}</span> de gains bruts
        pour{" "}
        <span className="text-red-400">${fmt(kpi.depenses)}</span> de dépenses et{" "}
        <span className="text-orange-400">${fmt(kpi.taxes)}</span> de taxes
        prélevées. Le solde net de la période est de{" "}
        <span
          className={`font-semibold ${
            kpi.net >= 0 ? "text-[#a89af9]" : "text-red-400"
          }`}
        >
          {kpi.net >= 0 ? "+" : ""}${fmt(kpi.net)}
        </span>
        {kpi.net < 0 && (
          <span className="text-white/30">
            {" "}— les charges dépassent les gains sur cette période.
          </span>
        )}
        .{" "}
        {topEmploye && (
          <>
            L'employé le plus contributeur est{" "}
            <span className="text-white/80">{topEmploye.nom}</span> avec{" "}
            <span className="text-green-400">${fmt(topEmploye.gains)}</span>{" "}
            générés sur {topEmploye.nbTransactions} transaction
            {topEmploye.nbTransactions > 1 ? "s" : ""}.
          </>
        )}
      </p>
    </div>
  );
}