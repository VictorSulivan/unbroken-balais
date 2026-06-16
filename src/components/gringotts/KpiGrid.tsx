"use client";

import { KpiData } from "types/analyse";
import { fmt } from "src/utils/buildMoisStats";

export function KpiGrid({ kpi }: { kpi: KpiData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Gains bruts"
        value={`+${fmt(kpi.gains)} Mornilles`}
        color="text-green-400"
        sub={`${kpi.nbTransactions} transactions`}
      />
      <KpiCard
        label="Dépenses"
        value={`-${fmt(kpi.depenses)} Mornilles`}
        color="text-red-400"
        sub="hors taxe Gringotts"
      />
      <KpiCard
        label="Taxe Gringotts"
        value={`-${fmt(kpi.taxes)} Mornilles`}
        color="text-orange-400"
        sub="prélevée sur retraits"
      />
      <KpiCard
        label="Solde net période"
        value={`${kpi.net >= 0 ? "+" : ""}${fmt(kpi.net)} Mornilles`}
        color={kpi.net >= 0 ? "text-[#a89af9]" : "text-red-400"}
        sub="gains − dépenses − taxes"
        highlight
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight
          ? "bg-[#1e1a3a] border-[#a89af9]/20"
          : "bg-[#16162a] border-white/10"
      }`}
    >
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  );
}