import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";
import { redirect } from "next/navigation";
import Link from "next/link";

const POSITIF = ["vente", "versement"];

const typeBadge: Record<string, string> = {
  vente:     "bg-green-500/10 text-green-400 border-green-500/20",
  versement: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  retrait:   "bg-red-500/10 text-red-400 border-red-500/20",
  salaire:   "bg-red-500/10 text-red-400 border-red-500/20",
  prime:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  taxe:      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  achat:     "bg-red-500/10 text-red-400 border-red-500/20",
};

// Interface pour récupérer les filtres depuis l'URL (Ex: ?type=vente&employeId=...)
interface PageProps {
  searchParams: Promise<{ type?: string; employeId?: string; search?: string }>;
}

export default async function HistoriqueGringottsPage({ searchParams }: PageProps) {
  const session = await auth();
  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");
  if (!acces.compta) redirect("/dashboard");

  const params = await searchParams;
  const currentType = params.type || "";
  const currentEmployeId = params.employeId || "";
  const currentSearch = params.search || "";

  // 1. Récupérer la liste des employés pour le filtre déroulant
  const employes = await prisma.employe.findMany({
    orderBy: { prenom: "asc" },
  });

  // 2. Construire la condition de filtrage Prisma dynamiquement
  const whereClause: any = {};
  
  if (currentType) {
    whereClause.typeTransaction = currentType;
  }
  if (currentEmployeId) {
    // Correction ici : Convertir la string "7" en Int 7 pour que Prisma soit content
    const parsedId = parseInt(currentEmployeId, 10);
    if (!isNaN(parsedId)) {
      whereClause.employeId = parsedId;
    }  
  }
  if (currentSearch) {
    whereClause.description = {
      contains: currentSearch,
      mode: 'insensitive', // Ignore les majuscules/minuscules
    };
  }

  // 3. Charger TOUTES les transactions filtrées (On en prend 200 par sécurité au lieu de bloquer à 20)
  const transactions = await prisma.transactionGringotts.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 200, 
    include: { employe: true },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/gringotts" className="text-xs text-white/40 hover:text-white transition-colors mb-2 inline-block">
            ← Retour aux finances
          </Link>
          <h1 className="text-2xl font-medium text-white">Historique complet</h1>
        </div>
        <div className="text-sm text-white/40">
          {transactions.length} transaction(s) trouvée(s)
        </div>
      </div>

      {/* BARRE DE FILTRES (Formulaire de méthode GET qui met à jour l'URL) */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-[#16162a] border border-white/10 rounded-xl p-4">
        {/* Recherche textuelle */}
        <div>
          <label className="block text-xs text-white/40 mb-1">Recherche</label>
          <input 
            type="text" 
            name="search"
            defaultValue={currentSearch}
            placeholder="Description label" 
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a89af9]"
          />
        </div>

        {/* Filtre par Type */}
        <div>
          <label className="block text-xs text-white/40 mb-1">Type de mouvement</label>
          <select 
            name="type" 
            defaultValue={currentType}
            className="w-full bg-[#16162a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a89af9]"
          >
            <option value="">Tous les types</option>
            {Object.keys(typeBadge).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Filtre par Employé */}
        <div>
          <label className="block text-xs text-white/40 mb-1">Par Employé</label>
          <select 
            name="employeId" 
            defaultValue={currentEmployeId}
            className="w-full bg-[#16162a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#a89af9]"
          >
            <option value="">Tous les employés</option>
            {employes.map((e) => (
              <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
            ))}
          </select>
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-end gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-[#2a2250] hover:bg-[#3d3580] border border-[#3d3580] text-[#a89af9] text-sm rounded-lg py-2 font-medium transition-colors"
          >
            Filtrer
          </button>
          {(currentType || currentEmployeId || currentSearch) && (
            <Link 
              href="/dashboard/gringotts/historique" 
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg text-center transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* TABLEAU DES RÉSULTATS */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Montant</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isPositif = POSITIF.includes(t.typeTransaction ?? "");
              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeBadge[t.typeTransaction ?? ""] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                      {t.typeTransaction ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/60">{t.description ?? "—"}</td>
                  <td className="px-5 py-4 text-white/60">
                    {t.employe ? `${t.employe.prenom} ${t.employe.nom}` : "—"}
                  </td>
                  <td className={`px-5 py-4 text-right font-medium ${isPositif ? "text-green-400" : "text-red-400"}`}>
                    {isPositif ? "+" : "-"}${t.montant?.toFixed(0) ?? "0"}
                  </td>
                  <td className="px-5 py-4 text-right text-white/40 text-xs">
                    {new Date(t.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-16 text-white/30">Aucune transaction ne correspond à vos filtres.</div>
        )}
      </div>
    </div>
  );
}