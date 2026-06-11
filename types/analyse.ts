export type Periode = "all" | "7j" | "30j" | "90j" | "annee" | "custom";

export const TYPES_POSITIFS = ["vente", "versement"] as const;
export const TYPES_NEGATIFS = ["retrait", "salaire", "achat", "prime"] as const;
export const TYPES_TAXE     = ["taxe"] as const;

export interface KpiData {
  gains: number;
  depenses: number;
  taxes: number;
  net: number;
  nbTransactions: number;
}

export interface EmployeStat {
  id: number;
  nom: string;
  gains: number;
  depenses: number;
  taxes: number;
  nbTransactions: number;
}

export interface TypeStat {
  type: string;
  montant: number;
}

export interface MoisStat {
  mois: string;      // "2024-03"
  label: string;     // "Mar 24"
  gains: number;
  depenses: number;
  taxes: number;
}