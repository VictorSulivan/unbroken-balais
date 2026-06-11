import { MoisStat, Periode } from "types/analyse";

// ─── Temps RP ────────────────────────────────────────────────────────────────
// 1 semaine réelle  = 1 semestre RP
// 2 semaines réelles = 1 an RP

export function getDateRange(
  periode: Periode,
  debut?: string,
  fin?: string
): { from?: Date; to?: Date } {
  const now = new Date();
  if (periode === "all") return {};
  if (periode === "custom" && debut && fin) {
    return { from: new Date(debut), to: new Date(fin + "T23:59:59") };
  }
  // Les durées sont exprimées en jours RÉELS
  const days: Record<string, number> = {
    "7j":  7,   // 1 semestre RP
    "30j": 14,  // ~1 an RP  (2 semaines réelles)
    "90j": 42,  // ~3 ans RP (6 semaines réelles)
    annee: 84,  // ~6 ans RP (12 semaines réelles)
  };
  const d = days[periode];
  if (!d) return {};
  const from = new Date(now);
  from.setDate(from.getDate() - d);
  return { from, to: now };
}

export function periodeLabel(
  periode: Periode,
  debut?: string,
  fin?: string
): string {
  if (periode === "all")    return "Depuis toujours";
  if (periode === "7j")     return "Dernier semestre RP (7 jours)";
  if (periode === "30j")    return "Dernière année RP (14 jours)";
  if (periode === "90j")    return "3 dernières années RP (42 jours)";
  if (periode === "annee")  return "6 dernières années RP (84 jours)";
  if (periode === "custom" && debut && fin) return `${debut} → ${fin}`;
  return "Période personnalisée";
}

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ─── Semaine ISO réelle → label RP ───────────────────────────────────────────

/** Retourne le lundi de la semaine contenant `date` */
function debutSemaine(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Numéro de semaine ISO */
function isoWeek(date: Date): number {
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Convertit un lundi réel en label RP.
 * Semaine paire  → "S1 AAAA" (1er semestre RP de l'année RP)
 * Semaine impaire → "S2 AAAA" (2e semestre RP de l'année RP)
 * Deux semaines consécutives forment une "année RP".
 */
function rpLabel(lundi: Date): { key: string; label: string } {
  const anneeReelle = lundi.getFullYear();
  const semIso      = isoWeek(lundi);
  // Chaque paire de semaines = 1 an RP
  // Semestre 1 = semaine ISO impaire, Semestre 2 = semaine ISO paire
  const anneeRp  = Math.floor((semIso - 1) / 2) + 1;
  const semestreRp = semIso % 2 === 1 ? 1 : 2;
  const key   = `${anneeReelle}-W${String(semIso).padStart(2, "0")}`;
  const label = `S${semestreRp} An${anneeRp}`;
  return { key, label };
}

// ─── Builder ─────────────────────────────────────────────────────────────────

export function buildMoisStats(
  transactions: Array<{
    typeTransaction: string | null;
    montant: number | null;
    createdAt: Date;
  }>
): MoisStat[] {
  // On réutilise MoisStat (champ "mois" = clé semaine, "label" = label RP)
  const map = new Map<string, MoisStat>();

  for (const t of transactions) {
    const lundi       = debutSemaine(new Date(t.createdAt));
    const { key, label } = rpLabel(lundi);

    if (!map.has(key)) {
      map.set(key, { mois: key, label, gains: 0, depenses: 0, taxes: 0 });
    }

    const s    = map.get(key)!;
    const m    = t.montant ?? 0;
    const type = t.typeTransaction ?? "";

    if (["vente", "versement"].includes(type))                           s.gains    += m;
    else if (type === "taxe")                                            s.taxes    += m;
    else if (["retrait", "salaire", "achat", "prime"].includes(type))   s.depenses += m;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}