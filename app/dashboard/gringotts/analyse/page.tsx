import { ClassementEmployes } from "@/components/gringotts/ClassementEmployes";
import { FiltrePeriode } from "@/components/gringotts/FiltrePeriode";
import { GraphiqueMensuel } from "@/components/gringotts/GraphiqueMensuel";
import { KpiGrid } from "@/components/gringotts/KpiGrid";
import { RepartitionTypes } from "@/components/gringotts/RepartitionTypes";
import { ResumeTextuel } from "@/components/gringotts/ResumeTextuel";
import { prisma }             from "@/lib/db/prisma";
import { auth }               from "@/lib/auth/auth";
import { getAcces }           from "@/utils/acces";
import { redirect }           from "next/navigation";
import Link                   from "next/link";

import {
  getDateRange,
  periodeLabel,
  buildMoisStats,
} from "src/utils/buildMoisStats";

import type { Periode, KpiData, EmployeStat, TypeStat } from "types/analyse";

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPES_POSITIFS = ["vente", "versement"];
const TYPES_NEGATIFS = ["retrait", "salaire", "achat", "prime"];

// ─── Props ───────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    periode?: string;
    debut?: string;
    fin?: string;
  }>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AnalyseGringottsPage({ searchParams }: PageProps) {
  const session = await auth();
  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");
  if (!acces.compta) redirect("/dashboard");

  const params  = await searchParams;
  const periode = (params.periode ?? "30j") as Periode;
  const debut   = params.debut;
  const fin     = params.fin;

  const { from, to } = getDateRange(periode, debut, fin);

  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to  } : {}),
          },
        }
      : {};

  // ── Fetch ────────────────────────────────────────────────────────────────

  const transactions = await prisma.transactionGringotts.findMany({
    where:   dateFilter,
    include: { employe: true },
    orderBy: { createdAt: "asc" },
  });

  // ── Calculs KPI ──────────────────────────────────────────────────────────

  let gains = 0, depenses = 0, taxes = 0;

  for (const t of transactions) {
    const m = t.montant ?? 0;
    if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      gains    += m;
    else if (t.typeTransaction === "taxe")                     taxes    += m;
    else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) depenses += m;
  }

  const kpi: KpiData = {
    gains,
    depenses,
    taxes,
    net: gains - depenses - taxes,
    nbTransactions: transactions.length,
  };

  // ── Répartition par type ─────────────────────────────────────────────────

  const typeMap = new Map<string, number>();
  for (const t of transactions) {
    const k = t.typeTransaction ?? "inconnu";
    typeMap.set(k, (typeMap.get(k) ?? 0) + (t.montant ?? 0));
  }

  const typesGains: TypeStat[] = [...typeMap.entries()]
    .filter(([k]) => TYPES_POSITIFS.includes(k))
    .map(([type, montant]) => ({ type, montant }));

  const typesCharges: TypeStat[] = [...typeMap.entries()]
    .filter(([k]) => !TYPES_POSITIFS.includes(k))
    .map(([type, montant]) => ({ type, montant }));

  // ── Classement employés ──────────────────────────────────────────────────

  const employeMap = new Map<number, EmployeStat>();
  const sansEmploye = { gains: 0, depenses: 0, taxes: 0 };

  for (const t of transactions) {
    const m = t.montant ?? 0;

    if (!t.employeId || !t.employe) {
      if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      sansEmploye.gains    += m;
      else if (t.typeTransaction === "taxe")                     sansEmploye.taxes    += m;
      else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) sansEmploye.depenses += m;
      continue;
    }

    const id = t.employeId;
    if (!employeMap.has(id)) {
      employeMap.set(id, {
        id,
        nom: `${t.employe.prenom} ${t.employe.nom}`,
        gains: 0,
        depenses: 0,
        taxes: 0,
        nbTransactions: 0,
      });
    }

    const s = employeMap.get(id)!;
    s.nbTransactions++;
    if (TYPES_POSITIFS.includes(t.typeTransaction ?? ""))      s.gains    += m;
    else if (t.typeTransaction === "taxe")                     s.taxes    += m;
    else if (TYPES_NEGATIFS.includes(t.typeTransaction ?? "")) s.depenses += m;
  }

  const employes: EmployeStat[] = [...employeMap.values()].sort(
    (a, b) =>
      (b.gains - b.depenses - b.taxes) - (a.gains - a.depenses - a.taxes)
  );

  // ── Graphique mensuel ────────────────────────────────────────────────────

  const moisStats = buildMoisStats(
    transactions.map((t) => ({
      typeTransaction: t.typeTransaction,
      montant:        t.montant,
      createdAt:      t.createdAt,
    }))
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link
            href="/dashboard/gringotts"
            className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block"
          >
            ← Retour aux finances
          </Link>
          <h1 className="text-2xl font-medium text-white">Analyse financière</h1>
          <p className="text-sm text-white/30 mt-0.5">
            {periodeLabel(periode, debut, fin)}
          </p>
        </div>
        <Link
          href="/dashboard/gringotts/historique"
          className="text-xs text-white/40 hover:text-white border border-white/10 rounded-lg px-3 py-2 transition-colors self-start sm:self-auto"
        >
          Historique complet →
        </Link>
      </div>

      {/* Filtres */}
      <FiltrePeriode />

      {/* KPIs */}
      <KpiGrid kpi={kpi} />

      {/* Graphique mensuel */}
      <GraphiqueMensuel mois={moisStats} />

      {/* Répartition par type */}
      <RepartitionTypes
        gains={typesGains}
        charges={typesCharges}
        totalGains={gains}
        totalCharges={depenses + taxes}
      />

      {/* Classement employés */}
      <ClassementEmployes employes={employes} sansEmploye={sansEmploye} />

      {/* Résumé */}
      <ResumeTextuel
        kpi={kpi}
        topEmploye={employes[0] ?? null}
        periode={periode}
        debut={debut}
        fin={fin}
      />

    </div>
  );
}